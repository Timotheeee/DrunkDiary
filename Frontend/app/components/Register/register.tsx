import React, {ReactNode} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Button, HelperText, TextInput, Title} from 'react-native-paper';
import style from './styles';
import Axios from 'axios';
import UsernameInput from '../UsernameInput/usernameInput';
import EmailInput from '../EmailInput/emailInput';
import PasswordInput from '../PasswordInput/passwordInput';
import globalStyle from '../../../assets/globalStyles';
import {navigateTo} from '../Helper/helper';

const server = require('../../../config').server;
const apiUser = require('../../../config').apiUser;

const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

type State = {
    email: string;
    password: string;
    password2: string;
    username: string;
    date: string;
    datePicker: any;
    userData: string;
    error: string;
    show: boolean;
};

export default class Register extends React.Component<State> {
    state: State = {
        email: '',
        password: '',
        password2: '',
        username: '',
        date: '',
        datePicker: new Date(),
        userData: '',
        error: '',
        show: false,
    };

    fieldRefs = {
        username: null,
        email: null,
        password: null,
        password2: null,
    };

    showDatepicker(): void {
        this.setState({show: true});
    }

    onChangeDate(date: any): void {
        let timestamp = date.nativeEvent.timestamp;
        this.setState({show: false});
        if (!isNaN(timestamp)) {
            let newDate = new Date(timestamp);
            let formattedDate = new Date(timestamp).toISOString().substr(0, 10);
            this.setState({datePicker: newDate});
            this.setState({date: formattedDate});
        }
    }

    registerUser(): void {
        try {
            Axios.post(server + apiUser + '/register', {
                name: this.state.username,
                email: this.state.email,
                password: this.state.password,
                birthdate: this.state.date,
            }).then(function (response) {
                if (response.status === 200) {
                    alert("Registration succeeded")
                }
            }).catch(function (error) {
                // example API Response on error
                // { validUserName:false, validEmail:true, userNameIsUnique:false, emailIsUnique:true, validPw : true };
                if (error.response) {
                    //request made and server responded
                    let errorResponse = JSON.parse(error.response.data);

                    if (!errorResponse.userNameIsUnique) {
                        alert("Username is already taken");
                    }
                    if (!errorResponse.emailIsUnique) {
                        alert("Email is already taken");
                    }
                    if (!errorResponse.validUsername) {
                        alert("Username is not valid");
                    }
                    if (!errorResponse.validEmail) {
                        alert("Email is not valid");
                    }
                    if (!errorResponse.validPw) {
                        alert("Password is not valid");
                    }
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            })

        } catch (errors) {
            console.log(errors);
            const formattedErrors = {};
            errors.foreach(
                (error) => (formattedErrors[error.field] = error.message),
            );

            this.setState({
                error: formattedErrors,
            });
        }
    }

    validateAll(): boolean {
        const {username, password, password2, email} = this.state;
        const validName =
            this.fieldRefs.username.state.isValid && username != '';
        const validEmail = this.fieldRefs.email.state.isValid && email != '';
        const validPwd =
            this.fieldRefs.password.state.isValid && password != '';
        const validPwd2 =
            this.fieldRefs.password2.state.isValid && password2 != '';
        let allValid = validName && validEmail && validPwd && validPwd2;

        if (this.isUserOver16() && allValid) {
            this.registerUser();
        } else {
            if (!this.isUserOver16()) {
                alert(
                    'You are too young to use DrinkDiary. You must be at least 16 years old!',
                );
            } else {
                alert(
                    'Please pay attention to the red text, registration is incorrect',
                );
            }
            return false;
        }
        return true;
    }

    isPassword2Empty(): boolean {
        return this.state.password2 != '';
    }

    passwordsNotMatching(): boolean {
        return this.state.password != this.state.password2;
    }

    // test is user over 16
    isUserOver16(): boolean {
        const {datePicker} = this.state;
        let birthday = datePicker;
        let now = new Date();

        let diffYear = (now.getTime() - birthday.getTime()) / 1000;
        diffYear /= 60 * 60 * 24 * 365.25;

        return diffYear >= 16;
    }

    validateAllAndRedirect(): void {
        if (this.validateAll()) {
            navigateTo(this, 'Login');
        }
    }

    render(): ReactNode {
        return (
            <KeyboardAvoidingView
                style={style.container}
                behavior='padding'
                keyboardVerticalOffset={keyboardVerticalOffset}
                enabled>
                <Title style={style.title}>Registration</Title>
                <ScrollView>
                    <UsernameInput
                        username={this.state.username}
                        ref={(ref) => {
                            this.fieldRefs.username = ref;
                        }}
                        onChange={(type, val) => this.setState({username: val})}
                    />
                    <EmailInput
                        email={this.state.email}
                        ref={(ref) => {
                            this.fieldRefs.email = ref;
                        }}
                        onChange={(type, val) => this.setState({email: val})}
                    />

                    <TextInput
                        style={globalStyle.formElemSpacing}
                        mode={'outlined'}
                        label='Birthdate'
                        placeholder={'DD.MM.YYYY'}
                        dense={true}
                        value={this.state.date}
                        ref={(ref) => ref && ref.blur()}
                        onFocus={() => this.showDatepicker()}
                    />
                    {this.state.show && (
                        <DateTimePicker
                            timeZoneOffsetInMinutes={0}
                            mode='date'
                            display='default'
                            value={this.state.datePicker}
                            onChange={(date) => this.onChangeDate(date)}
                        />
                    )}

                    <PasswordInput
                        password={this.state.password}
                        ref={(ref) => {
                            this.fieldRefs.password = ref;
                        }}
                        onChange={(type, val) => this.setState({password: val})}
                    />
                    <PasswordInput
                        password={this.state.password2}
                        ref={(ref) => {
                            this.fieldRefs.password2 = ref;
                        }}
                        validate={false}
                        confirm={true}
                        onChange={(type, val) =>
                            this.setState({password2: val})
                        }
                    />
                    <HelperText
                        type='error'
                        visible={this.passwordsNotMatching()}
                        style={
                            this.passwordsNotMatching()
                                ? ''
                                : globalStyle.hiddenMessage
                        }>
                        - Passwords do not match!
                    </HelperText>

                    <Button
                        style={globalStyle.formElemSpacing}
                        mode={'contained'}
                        onPress={() => this.validateAllAndRedirect()}>
                        Hook me up
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}
