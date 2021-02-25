import React, {ReactNode} from 'react';
import axios from 'axios';
import {Alert, ScrollView, Text, View} from 'react-native';
import ColorPalette from 'react-native-color-palette';
import {
    Button,
    Dialog,
    HelperText,
    Portal,
    Provider as PaperProvider,
    Snackbar,
    Title,
} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';
import BuddyList from '../BuddyList/buddyList';
import EmailInput from '../EmailInput/emailInput';
import UsernameInput from '../UsernameInput/usernameInput';
import PasswordInput from '../PasswordInput/passwordInput';
import UserIcon from '../UserIcon/userIcon';
import {updateCurrentUserColor} from '../Helper/userManagement';

const server = require('../../../config').server;
const apiUser = require('../../../config').apiUser;

type Props = {
    route: any;
};

type State = {
    username: string;
    email: string;
    color: string;
    password: string;
    password2: string;
    showPwd: boolean;
    visible: boolean;
    snackBar: {visible: boolean; msg: string};
};
const updateUrl: string = server + apiUser + '/update';
const colorOptions = [
    '#dd2c00',
    '#ffb74d',
    '#ffff00',
    '#ea80fc',
    '#aa00ff',
    '#2962ff',
    '#006064',
    '#64ffda',
    '#76ff03',
    '#795548',
    '#000000',
    '#ffffff',
];
/**
 * This class implements the profile page.
 */
export default class Profile extends React.Component<Props, State> {
    props: Props;

    state: State = {
        username: this.props.route.params.name,
        email: this.props.route.params.email,
        color: this.props.route.params.color,
        password: '',
        password2: '',
        showPwd: false,
        visible: false,
        snackBar: {visible: false, msg: ''},
    };

    fieldRefs = {
        password: null,
        password2: null,
    };

    showDialog(): void {
        this.setState({visible: true});
    }

    hideDialog(): void {
        this.setState({visible: false});
    }

    /**
     * Validates the password the user has entered. If valid (see comments of PasswordInput Components), password will be saved.
     * Otherwise, there will be an alert.
     */
    validateInput(): void {
        const {password, password2} = this.state;
        if (
            (this.fieldRefs.password.state.isValid &&
                this.fieldRefs.password2.state.isValid &&
                password.localeCompare(password2) === 0) ||
            (password === '' && password2 === '')
        ) {
            this.saveProfile();
        } else {
            Alert.alert(
                'Oops',
                'Passwords do not seem to match. Please try again.',
            );
        }
    }

    /**
     * Checks whether passwords are not matching.
     * @return true, if passwords are not matching
     */
    arePasswordsNotMatching(): boolean {
        return this.state.password !== this.state.password2;
    }

    /**
     * Empties password input fields.
     */
    emptyPasswords(): void {
        this.state.password = '';
        this.state.password2 = '';
    }

    /**
     * Saves the changes made in the profile page.
     * If a mistake occurs while saving, a message is shown to the user.
     */
    saveProfile(): void {
        let user = {
            email: this.state.email,
            password: this.state.password,
            color: this.state.color,
        };
        axios
            .post(updateUrl, user)
            .then(
                function () {
                    this.emptyPasswords();
                    this.setState({snackBar: {visible: true, msg: 'saved'}});
                    updateCurrentUserColor(this.state.color);
                }.bind(this),
            )
            .catch(
                function (error) {
                    console.log(error);
                    this.setState({
                        snackBar: {visible: true, msg: 'failed to save'},
                    });
                }.bind(this),
            );
    }

    render(): ReactNode {
        return (
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
                <PaperProvider>
                    <View style={globalStyle.containerPadding}>
                        <Title>Profile settings</Title>
                        <UsernameInput
                            username={this.state.username}
                            disabled={true}
                        />
                        <EmailInput
                            email={this.state.email}
                            disabled={true}
                            validate={false}
                        />
                        <PasswordInput
                            password={this.state.password}
                            enableShowPwd={false}
                            ref={(ref) => {
                                this.fieldRefs.password = ref;
                            }}
                            onChange={(type, val) =>
                                this.setState({password: val})
                            }
                        />
                        <PasswordInput
                            password={this.state.password2}
                            confirm={true}
                            enableShowPwd={false}
                            ref={(ref) => {
                                this.fieldRefs.password2 = ref;
                            }}
                            onChange={(type, val) =>
                                this.setState({password2: val})
                            }
                        />
                        <HelperText
                            type='error'
                            visible={this.arePasswordsNotMatching()}
                            style={
                                this.arePasswordsNotMatching()
                                    ? ''
                                    : globalStyle.hiddenMessage
                            }>
                            - Passwords do not match
                        </HelperText>
                        <View
                            style={[
                                globalStyle.row,
                                globalStyle.formElemSpacing,
                            ]}>
                            <UserIcon
                                name={this.state.username}
                                color={this.state.color}
                            />
                            <Button
                                color={'#000'}
                                onPress={() => this.showDialog()}>
                                change color
                            </Button>
                        </View>
                        <Button
                            style={globalStyle.formElemSpacing}
                            mode='contained'
                            onPress={() => this.validateInput()}>
                            Save
                        </Button>
                        <BuddyList
                            buddies={this.props.route.params.buddies}
                            email={this.state.email}
                        />

                        {/* ---------- Overlay elements ---------- */}
                        {/*save confirmation*/}
                        <Snackbar
                            visible={this.state.snackBar.visible}
                            duration={2000}
                            onDismiss={() =>
                                this.setState({
                                    snackBar: {visible: false, msg: ''},
                                })
                            }>
                            {this.state.snackBar.msg}
                        </Snackbar>

                        {/*color picker*/}
                        <Portal>
                            <Dialog
                                visible={this.state.visible}
                                onDismiss={this.hideDialog.bind(this)}>
                                <Dialog.Title>
                                    Please choose your icon color
                                </Dialog.Title>
                                <Dialog.Content>
                                    <ColorPalette
                                        title={''}
                                        value={this.state.color}
                                        icon={<Text>✔</Text>}
                                        onChange={(val) =>
                                            this.setState({color: val})
                                        }
                                        colors={colorOptions}
                                    />
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button onPress={() => this.hideDialog()}>
                                        Done
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                    </View>
                </PaperProvider>
            </ScrollView>
        );
    }
}
