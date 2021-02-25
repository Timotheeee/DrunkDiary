import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {
    Avatar,
    Button,
    Divider,
    List,
    Snackbar,
    TextInput,
} from 'react-native-paper';
import Room from './room';
import Game from '../Game/game';
import globalStyle from '../../../assets/globalStyles';
import style from './styles';
import {ScrollView} from 'react-native-gesture-handler';
import {displayMessage} from '../Helper/helper';
import {addBuddy} from '../Helper/buddyManagement';

type Props = {
    socket: any;
    userName: string;
    userEmail: string;
    buddies: Buddy[];
};

type State = {
    partyCode: number;
    roomName: string;
    currentRoom: number;
    started: boolean;
    players: {name: string}[]; // TODO: extendable to add color of player icons
    isHost: boolean;
    snackBar: SnackBar;
    expanded: boolean;
};

export default class Lobby extends React.Component<Props, State> {
    /// Configuration values
    defaultRoomName: string = 'Anonymous Alcoholics';
    alertDuration: number = 4000; // in milliseconds
    props: Props;
    state: State = {
        partyCode: null,
        roomName: this.defaultRoomName,
        currentRoom: -1, // required to stop the lobby from rendering faster then the room component on a reconnect
        started: false,
        players: [],
        isHost: false,
        snackBar: {visible: false, msg: ''},
        expanded: true,
    };
    private readonly socket: any;
    private readonly userName: string;

    constructor(props: any) {
        super(props);

        // needed to bind the `this` object in functions passed to children components
        this.create = this.create.bind(this);
        this.join = this.join.bind(this);
        this.start = this.start.bind(this);
        this.kick = this.kick.bind(this);
        this.end = this.end.bind(this);
        this.leave = this.leave.bind(this);

        this.socket = this.props.socket;
        this.userName = this.props.userName;
    }

    /// Mount callback
    /**
     * Fires a new `identify` event each time this component mounts which enables the socket to reconnect to a
     * previously joined room if the connection was just recently (timeout duration is defined and handled in backend).
     *
     * On the callback it receives either a valid roomId called `partyCode` or null which triggers conditional rendering.
     */
    componentDidMount(): void {
        this.socket.emit('identify', this.userName, (partyCode) =>
            this.onUserIsInRoom(partyCode),
        );
    }

    /// Callbacks
    /**
     * Calls the callback to join a room if `partyCode` is valid (i.e. not null) and updates state of `currentRoom` or
     * triggers the conditional rendering of the lobby otherwise.
     * @param {number} partyCode - Number identifying the current room the user is in or null if the user is in no room.
     */
    onUserIsInRoom(partyCode: number): void {
        console.log(
            'Identified user ' +
                this.userName +
                ' assigned to room ' +
                partyCode,
        );
        if (partyCode) {
            this.onRoomJoined(partyCode);
        } else {
            this.setState({currentRoom: null});
        }
    }

    /**
     * Sets state of `currentRoom` to trigger conditional rendering of the room component, subscribes to all important
     * events and sends an ACK to the server to trigger a `roomUpdate` event on the server.
     * @param {number} partyCode - Number identifying the current room the user is in.
     */
    onRoomJoined(partyCode: number): void {
        this.setState({currentRoom: partyCode});
        console.log(this.userName + ' joined room ' + partyCode);
        if (partyCode) {
            this.askIfIsHost(partyCode, this.userName);
            this.socket.on('roomUpdate', (players, started, roomName) =>
                this.onRoomUpdate(players, started, roomName),
            );
            this.socket.on('gotKicked', () => this.onGotKicked());
            this.socket.on('gameStarted', () => this.onGameStarted());
            this.socket.on('gameEnded', (msg) => this.onGameEnded(msg));
            this.socket.on('roomEnds', (msg) => this.onRoomEnds(msg));
            this.socket.on('msg', (msg) => this.sendAlert(msg));
            this.socket.emit('userJoinedAndReady', partyCode, this.userName);

            // TODO: add new listeners (this.socket.on('event')) for game logic here
            // If they are placed somewhere else, reconnecting users won't be able to reconnect to a running game
        }
    }

    /**
     * Same functionality as `onRoomJoined` (`onRoomJoined` is called) but also sends an alert to the user
     * about the newly generated `partyCode`.
     * @param {number} partyCode - Number identifying the current room the user is in.
     */
    onRoomCreated(partyCode: number): void {
        console.log(this.userName + ' created room ' + partyCode);
        this.onRoomJoined(partyCode);
        this.sendAlert(
            'Your party code is ' +
                partyCode +
                ' share it with your friends to get the party going!',
        );
    }

    /**
     * Sets state uf all updated room information and triggers a rerender.
     * @param {{name: string}[]} players - List of all the players in the current room.
     * @param {boolean} started - Says whether the game in the current room has started or not.
     * @param {string} roomName - Name of the current room.
     */
    onRoomUpdate(
        players: {name: string}[],
        started: boolean,
        roomName: string,
    ): void {
        console.log('New players update: ' + players);
        this.setState({
            players: players,
            started: started,
            roomName: roomName,
        });
    }

    /**
     * Deletes state of `currentRoom` which triggers rendering of the lobby and sends an alert to the user about it.
     */
    onGotKicked(): void {
        this.setState({currentRoom: null});
        this.sendAlert('You got kicked from the room!');
    }

    /**
     * Sets state of `isHost` to trigger conditional rendering of host options in the room component.
     * @param {boolean} isHost - Says whether the user is room host or not.
     */
    onIsHost(isHost: boolean): void {
        this.setState({isHost: isHost});
    }

    /**
     * Sets state of `started` to trigger rendering of the game component.
     */
    onGameStarted(): void {
        this.setState({started: true});
    }

    /**
     * Resets states `started` to trigger rendering of the room component and sends an alert to the user about it.
     * @param {string} msg - Message to send in an alert.
     */
    onGameEnded(msg: string): void {
        this.setState({started: false});
        this.sendAlert(msg);
    }

    /**
     * Resets all room states, state `currentRoom` triggers rendering of the lobby.
     * @param {string} msg - Message to send in an alert.
     */
    onRoomEnds(msg: string): void {
        this.setState({
            currentRoom: null,
            roomName: this.defaultRoomName,
            started: false,
            players: [],
        });
        this.sendAlert(msg);
    }

    /// Helper functions
    /**
     * Triggers a render of the snackBar for `alertDuration` milliseconds with message `msg`.
     * @param {string} msg - Message to send in an alert.
     */
    sendAlert(msg: string): void {
        displayMessage.bind(this)(msg);
    }

    /**
     * Triggers event on server to create a new room and redirects callback.
     */
    create(): void {
        this.socket.emit('createRoom', this.state.roomName, (partyCode) =>
            this.onRoomCreated(partyCode),
        );
    }

    /**
     * Triggers event on server to join a room and redirects callback dependent on whether this was successful.
     * @param {number} partyCode - Number identifying the desired room to join.
     */
    join(partyCode: number): void {
        this.socket.emit('joinRoom', partyCode, (callback) =>
            callback.success
                ? this.onRoomJoined(partyCode)
                : this.sendAlert("Can't join this party..\n" + callback.msg),
        );
    }

    /**
     * Triggers event on server to start the `currentRoom`.
     */
    start(): void {
        this.socket.emit('startGame', this.state.currentRoom);
    }

    /**
     * Triggers event on server to kick `userName` from room `partyCode`.
     * @param {string} userName - Username of the user to kick.
     * @param {number} partyCode - Number identifying the current room the user is in.
     */
    kick(userName: string, partyCode: number): void {
        this.socket.emit('kickUser', userName, partyCode);
    }

    /**
     * Triggers event on server to end the current room `partyCode`.
     * @param {number} partyCode - Number identifying the current room the user is in.
     */
    end(partyCode: number): void {
        this.socket.emit('endRoom', partyCode);
    }

    /**
     * Triggers event on server to leave the current room `partyCode`.
     * @param {number} partyCode - Number identifying the current room the user is in.
     */
    leave(partyCode: number): void {
        this.socket.emit('leaveRoom', partyCode);
    }

    /**
     * Triggers event on server to ask if `userName` (current user) is host of room `partyCode` and redirects callback.
     * @param {number} partyCode - Number identifying the current room the user is in.
     * @param {string} userName - Username the backend whether it is host.
     */
    askIfIsHost(partyCode: number, userName: string): void {
        this.socket.emit('isHost', partyCode, userName, (isHost) =>
            this.onIsHost(isHost),
        );
    }

    render(): ReactNode {
        return (
            <View>
                {!this.state.currentRoom ? (
                    <ScrollView
                        style={[globalStyle.containerPadding, style.lobby]}>
                        <Avatar.Image
                            size={110}
                            style={style.avatar}
                            source={require('../../../assets/Beer_image.png')}
                        />
                        <Divider />
                        <List.Accordion
                            title='Join a Party'
                            description='Join an ongoing party of your friends'
                            expanded={this.state.expanded}
                            onPress={() => this.setState({expanded: true})}>
                            <TextInput
                                label=''
                                maxLength={20}
                                placeholder={'Enter your party code...'}
                                onChangeText={(partyCode) =>
                                    this.setState({
                                        partyCode: parseInt(partyCode),
                                    })
                                }
                            />
                            <Button
                                mode='outlined'
                                onPress={() => this.join(this.state.partyCode)}>
                                Join Party
                            </Button>
                        </List.Accordion>
                        <Divider />
                        <List.Accordion
                            title='New Party'
                            description='Create a room to start a new party'
                            expanded={!this.state.expanded}
                            onPress={() => this.setState({expanded: false})}>
                            <TextInput
                                label=''
                                maxLength={30}
                                placeholder={'Enter your room name...'}
                                onChangeText={(roomName) =>
                                    this.setState({roomName: roomName})
                                }
                            />
                            <Button
                                mode='outlined'
                                onPress={() => this.create()}>
                                Create Party
                            </Button>
                        </List.Accordion>
                    </ScrollView>
                ) : (
                    <View>
                        {!this.state.started ? (
                            <View>
                                {this.state.players.length !== 0 && (
                                    <Room
                                        partyCode={this.state.currentRoom}
                                        roomName={this.state.roomName}
                                        players={this.state.players}
                                        buddies={this.props.buddies}
                                        start={this.start}
                                        kick={this.kick}
                                        end={this.end}
                                        leave={this.leave}
                                        addBuddy={addBuddy.bind(this)}
                                        isHost={this.state.isHost}
                                        ownName={this.userName}
                                        ownEmail={this.props.userEmail}
                                    />
                                )}
                            </View>
                        ) : (
                            <View style={globalStyle.containerPadding}>
                                <Game
                                    userName={this.props.userName}
                                    roomName={this.state.roomName}
                                    socket={this.socket}
                                />
                            </View>
                        )}
                    </View>
                )}
                <Snackbar
                    visible={this.state.snackBar.visible}
                    duration={this.alertDuration}
                    onDismiss={() =>
                        this.setState({snackBar: {visible: false, msg: ''}})
                    }
                    action={{
                        label: 'OK',
                        onPress: () =>
                            this.setState({
                                snackBar: {visible: false, msg: ''},
                            }),
                    }}>
                    {this.state.snackBar.msg}
                </Snackbar>
            </View>
        );
    }
}
