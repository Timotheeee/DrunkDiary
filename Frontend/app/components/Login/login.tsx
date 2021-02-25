import React, {ReactNode} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import style from './styles';

import {Button, HelperText, Title} from 'react-native-paper';
import {navigateTo} from '../Helper/helper';
import EmailInput from '../EmailInput/emailInput';
import PasswordInput from '../PasswordInput/passwordInput';
import globalStyle from '../../../assets/globalStyles';
import {goToMainPageIfLoggedIn, setCurrentUser} from '../Helper/userManagement';

const server = require('../../../config').server;
const apiUser = require('../../../config').apiUser;
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
const serverIp = server + apiUser + '/validate';
const axios = require('axios');
const ACCEPT_STATUS = 202;

type State = {
    email: string;
    password: string;
    userValid: boolean;
};

export default class Login extends React.Component<State> {
    state: State = {
        email: '',
        password: '',
        userValid: true,
    };

    componentDidMount(): void {
        goToMainPageIfLoggedIn(this);
    }

    validateUser(): void {
        let state = this.state;
        let that = this;
        console.log('send');
        axios({
            method: 'post',
            url: serverIp,
            data: {
                email: this.state.email,
                password: this.state.password,
            },
        })
            .then(function (response) {
                state.userValid = response.status === ACCEPT_STATUS;
                if (!state.userValid) {
                    setCurrentUser(response);
                    state.password = '';
                }
                that.setState(state);
                that.forceUpdate();
                navigateTo(that, 'Main Page');
            })
            .catch((error) => {
                //error case
                if (error.response) {
                    /*
                     * The request was made and the server responded with a
                     * status code that falls out of the range of 2xx
                     */
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else if (error.request) {
                    /*
                     * The request was made but no response was received, `error.request`
                     * is an instance of XMLHttpRequest in the browser and an instance
                     * of http.ClientRequest in Node.js
                     */
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request and triggered an Error
                    console.log('Error', error.message);
                }
                state.userValid = error.status === ACCEPT_STATUS;
                that.setState({userValid: false});
            });
    }

    render(): ReactNode {
        return (
            <KeyboardAvoidingView
                style={style.container}
                behavior='padding'
                keyboardVerticalOffset={keyboardVerticalOffset}
                enabled>
                <Title style={style.title}>Login</Title>
                <ScrollView>
                    <EmailInput
                        email={this.state.email}
                        validate={false}
                        onChange={(type, val) => this.setState({email: val})}
                    />
                    <PasswordInput
                        password={this.state.password}
                        validate={false}
                        onChange={(type, val) => this.setState({password: val})}
                    />
                    <HelperText visible={!this.state.userValid}>
                        No such user exists.
                    </HelperText>
                    <Button
                        style={globalStyle.formElemSpacing}
                        mode={'contained'}
                        onPress={() => this.validateUser()}
                        disabled={this.state.password.length === 0}>
                        Hook me up
                    </Button>
                    <Button
                        style={globalStyle.formElemSpacing}
                        mode={'outlined'}
                        onPress={() => navigateTo(this, 'Register')}>
                        Register
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}
