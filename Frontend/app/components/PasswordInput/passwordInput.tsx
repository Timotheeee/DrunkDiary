import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {Checkbox, HelperText, Paragraph, TextInput, TouchableRipple,} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';

type Props = {
    password: string;
    disabled?: boolean;
    validate?: boolean;
    confirm?: boolean;
    enableShowPwd?: boolean;
    onChange?: (type: string, val: string) => void;
    style?: StyleProp<ViewStyle>;
};

type State = {
    password: string;
    showPassword: boolean;
    isValid: boolean;
    refresh: boolean;
};

export default class PasswordInput extends React.Component<Props, State> {
    public static defaultProps: Partial<Props> = {
        disabled: false,
        validate: true,
        confirm: false,
        enableShowPwd: false,
        onChange: (type: string, val: string) => {},
    };

    state: State = {
        password: this.props.password,
        showPassword: false,
        isValid: false,
        refresh: false,
    };

    UNSAFE_componentWillReceiveProps(props) {
        const {refresh} = this.state;
        if (props.refresh !== refresh) {
            this.setState({password: props.password});
        }
    }

    componentDidMount(): void {
        this.validate();
    }

    shouldComponentUpdate(): boolean {
        return true;
    }

    refresh = () => this.setState({refresh: !this.state.refresh});

    /**
     * update state value of "password" on change
     * @param val: new value
     * */
    onChange(val: string): void {
        this.setState({password: val});
    }

    /**
     * pass the password to the parent component
     * */
    updateParent(): void {
        this.validate();
        this.props.onChange('password', this.state.password);
    }

    /**
     * sets the state "valid" to true if:
     *  - password not empty
     *  - password has at least 8 characters
     * */
    validate(): void {
        let valid =
            this.isPasswordValid() &&
            !this.isPasswordTooShort() &&
            !this.isPasswordEmpty();
        this.setState({isValid: valid});
    }

    /**
     * show helper messages only, if validation is enabled
     * @return true, if enabled
     * */
    showMessages(): boolean {
        return this.props.validate && !this.isPasswordEmpty();
    }

    /**
     * check if password is empty
     * @return {boolean} true, if password is empty
     * */
    isPasswordEmpty(): boolean {
        return this.state.password == '';
    }

    /**
     * check length of password
     * @return {boolean} true, if password has less than 8 characters
     * */
    isPasswordTooShort(): boolean {
        const {password} = this.state;
        let regexPasswordMIN8 = /^.{8,}$/;
        return !regexPasswordMIN8.test(password);
    }

    /**
     * check if password contains:
     *  - capital letters and small letters
     *  - numbers
     *  - special characters
     *  @return true, if all listed characters are included
     * */
    isPasswordValid(): boolean {
        const {password} = this.state;
        let regexPassword = /^(?=.*?[a-z_])(?=.*?[A-Z])(?=.*?[0-9_])(?=.*?\W).*$/;
        return regexPassword.test(password);
    }

    render(): ReactNode {
        return (
            <View style={this.props.style}>
                <TextInput
                    style={globalStyle.formElemSpacing}
                    mode={'outlined'}
                    dense={true}
                    onBlur={() => this.updateParent()}
                    label={this.props.confirm ? 'Confirm Password' : 'Password'}
                    value={this.state.password}
                    secureTextEntry={!this.state.showPassword}
                    onChangeText={(val) => this.onChange(val)}
                />
                {this.props.enableShowPwd && (
                    <TouchableRipple
                        onPress={() =>
                            this.setState({
                                showPassword: !this.state.showPassword,
                            })
                        }>
                        <View style={globalStyle.row}>
                            <Checkbox
                                status={
                                    this.state.showPassword
                                        ? 'checked'
                                        : 'unchecked'
                                }
                            />
                            <Paragraph>Show characters</Paragraph>
                        </View>
                    </TouchableRipple>
                )}
                <HelperText
                    type='error'
                    visible={!this.isPasswordValid() && this.showMessages()}
                    style={
                        !this.isPasswordValid() && this.showMessages()
                            ? ''
                            : globalStyle.hiddenMessage
                    }>
                    - Password needs: Small and capital letters + numbers and
                    special characters
                </HelperText>
                <HelperText
                    type='error'
                    visible={this.isPasswordTooShort() && this.showMessages()}
                    style={
                        this.isPasswordTooShort() && this.showMessages()
                            ? ''
                            : globalStyle.hiddenMessage
                    }>
                    - Password is too short (min. 8 characters)
                </HelperText>
            </View>
        );
    }
}
