import * as React from 'react';
import {ReactNode} from 'react';

import {View} from 'react-native';
import {Button, Title} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';
import {getCurrentUser} from '../Helper/userManagement';
import {clearAsyncStorage, navigateTo} from '../Helper/helper';

type State = {
    name: string;
    password: string;
    email: string;
    color: string;
    buddies: Buddy[];
};
/**
 * This class implements the main page.
 */
export default class Main extends React.Component<State> {
    private userWantsToLogout: boolean = false;
    state: State = {
        name: '',
        password: '',
        email: '',
        color: '',
        buddies: [],
    };

    componentDidMount(): void {
        this.loadUser();
    }

    /**
     * As long as the user does not want to logout, the user will be loaded after an update.
     */
    componentDidUpdate(): void {
        if (!this.userWantsToLogout) {
            this.loadUser();
        }
    }

    /**
     * loads the user from the AsyncStorage.
     * If an error occurs while loading, the error will be logged.
     */
    loadUser(): void {
        getCurrentUser()
            .then((userString: string) => {
                if (userString) {
                    let user: any = JSON.parse(userString);
                    this.setState({
                        name: user.name,
                        email: user.email,
                        birthdate: user.birthdate,
                        color: user.color,
                        buddies: user.friends,
                    });
                }
            })
            .catch(function (e: Error) {
                console.error(
                    'Error getting current user from AsyncStorage: ' +
                        e.message,
                );
            });
    }

    /**
     * Logs the user out and then navigates to Login page.
     */
    logout(): void {
        this.userWantsToLogout = true;
        clearAsyncStorage();
        navigateTo(this, 'Login');
    }

    render(): ReactNode {
        return (
            <View style={globalStyle.containerPadding}>
                <Title> Drunk Diary Main Page</Title>
                <Button
                    mode='contained'
                    style={globalStyle.formElemSpacing}
                    onPress={() => navigateTo(this, 'LobbyContainer')}>
                    Lobby{' '}
                </Button>
                <Button
                    mode='contained'
                    style={globalStyle.formElemSpacing}
                    onPress={() => navigateTo(this, 'Drunk Map', this.state)}>
                    Map{' '}
                </Button>
                <Button
                    mode='contained'
                    style={globalStyle.formElemSpacing}
                    onPress={() => navigateTo(this, 'Profile', this.state)}>
                    Profile{' '}
                </Button>
                <Button
                    mode='contained'
                    style={globalStyle.formElemSpacing}
                    onPress={() => this.logout()}>
                    Logout
                </Button>
            </View>
        );
    }
}
