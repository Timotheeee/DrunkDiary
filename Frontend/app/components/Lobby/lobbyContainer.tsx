import React, {ReactNode} from 'react';
import Lobby from './lobby';
import SocketIOClient from 'socket.io-client';
import {Alert, AsyncStorage, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import style from './styles';
import {navigateTo} from '../Helper/helper';

const server = require('../../../config').server;

type State = {
    userName: string;
    userEmail: string;
    buddies: Buddy[];
    authorized: boolean;
    socket: SocketIOClient.Socket;
    connectionTimeout: NodeJS.Timeout;
};

export default class LobbyContainer extends React.Component<State> {
    /// Configuration values
    timeoutInMilliSeconds: number = 10 * 1000;
    state: State = {
        userName: '',
        userEmail: '',
        authorized: false,
        socket: null,
        connectionTimeout: null,
        buddies: [],
    };

    /// Mount/Unmount callbacks
    componentDidMount(): void {
        let socket: SocketIOClient.Socket = SocketIOClient.connect(server);
        this.state.connectionTimeout = setTimeout(
            () => this.connectionTimedOut(socket),
            this.timeoutInMilliSeconds,
        );
        this.connectToServer(socket);
    }

    componentWillUnmount(): void {
        if (this.state.connectionTimeout) {
            clearTimeout(this.state.connectionTimeout);
        }
        if (this.state.socket) {
            this.state.socket.close();
        }
    }

    /// Helper functions
    /**
     * If server isn't reachable for `timeoutAfterXMinutes` minutes the socket is closed and the user gets an alert about it.
     * @param {SocketIOClient.Socket} socket - The socket object to exchange messages with the server.
     */
    connectionTimedOut(socket: SocketIOClient.Socket): void {
        socket.close();
        Alert.alert(
            'Connection timed out',
            "The server can't be contacted. Please check your internet connection or contact an administrator.",
            [
                {text: 'Retry', onPress: () => this.componentDidMount()},
                {text: 'Back', onPress: () => navigateTo(this, 'Main Page')},
            ],
            {cancelable: false},
        );
    }

    /**
     * Establishes initial connection to the server.
     * @param {SocketIOClient.Socket} socket - The socket object to exchange messages with the server.
     */
    async connectToServer(socket: SocketIOClient.Socket): Promise<void> {
        let jwtToken: string = await this.getTokenAndName();
        socket.on('connect', () => this.authenticateSocket(socket, jwtToken));
    }

    /**
     * Loads the relevant data from Asyncstorage and updates the state.
     */
    async getTokenAndName(): Promise<string> {
        try {
            let value: string = await AsyncStorage.getItem('currentUser');
            if (value) {
                let token: string = JSON.parse(value).token;
                let name: string = JSON.parse(value).name;
                let email: string = JSON.parse(value).email;
                let buddies: Buddy[] = JSON.parse(value).friends;
                this.setState({
                    userName: name,
                    userEmail: email,
                    buddies: buddies,
                });
                return token;
            }
            return null;
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Tries to authenticate current user with a valid jwt token and reroutes the response.
     * @param {SocketIOClient.Socket} socket - The socket object to exchange messages with the server.
     * @param {string} jwtToken - JSON Web Token that was given by the server on login communication.
     */
    authenticateSocket(socket: SocketIOClient.Socket, jwtToken: string): void {
        clearTimeout(this.state.connectionTimeout);
        socket
            .emit('authenticate', {token: jwtToken})
            .on('authenticated', () => this.onAuthorizedRequest(socket))
            .on('unauthorized', (msg) =>
                this.onUnauthorizedRequest(socket, msg),
            );
    }

    onAuthorizedRequest(socket: SocketIOClient.Socket): void {
        // setting authorized to false first is necessary to ensure that the `Lobby` component remounts in case it
        // was already mounted (app was open during server restart)
        this.setState({socket: socket, authorized: false});
        this.setState({authorized: true});
    }

    onUnauthorizedRequest(socket: SocketIOClient.Socket, msg: any): void {
        console.log(
            'Unauthorized request by socket ' + socket.id + ' to lobby.',
        );
        console.log('Reason: ' + JSON.stringify(msg.data));
        Alert.alert(
            'Not logged in',
            'You need to be registered/logged in to join a lobby.',
            [
                {
                    text: 'Take me there',
                    onPress: () => navigateTo(this, 'Login'),
                },
                {text: 'Back', onPress: () => navigateTo(this, 'Main Page')},
            ],
            {cancelable: false},
        );
    }

    render(): ReactNode {
        return (
            <View>
                {this.state.authorized ? (
                    <Lobby
                        socket={this.state.socket}
                        userName={this.state.userName}
                        userEmail={this.state.userEmail}
                        buddies={this.state.buddies}
                    />
                ) : (
                    <View style={style.avatar}>
                        <ActivityIndicator size='large' style={{flex: 1}} />
                        <Text>Connecting to server...</Text>
                    </View>
                )}
            </View>
        );
    }
}
