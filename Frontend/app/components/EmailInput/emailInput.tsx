import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';

type Props = {
    email: string;
    disabled?: boolean;
    validate?: boolean;
    onChange?: (type: string, val: string) => void;
    style?: StyleProp<ViewStyle>;
};

type State = {
    email: string;
    isValid: boolean;
};

export default class EmailInput extends React.Component<Props, State> {
    public static defaultProps: Partial<Props> = {
        disabled: false,
        validate: true,
        onChange: (type: string, val: string) => {},
    };

    state: State = {
        email: this.props.email,
        isValid: false,
    };

    componentDidMount(): void {
        this.validate();
    }

    /**
     * update state value of "email" on change
     * @param val: new value
     * */
    onChange(val: string): void {
        this.setState({email: val});
    }

    /**
     * pass the email to the parent component
     * */
    updateParent(): void {
        this.validate();
        this.props.onChange('email', this.state.email);
    }

    /**
     * sets the state "valid" to true if:
     *  - email not empty
     *  - email format is valid
     * */
    validate(): void {
        let valid = !this.isEmailEmpty() && this.isEmailValid();
        this.setState({isValid: valid});
    }

    /**
     * show helper messages only, if validation is enabled
     * @return true, if enabled
     * */
    showErrorMessage(): boolean {
        return (
            this.props.validate && !this.isEmailEmpty() && !this.isEmailValid()
        );
    }

    /**
     * check if email is empty
     * @return {boolean} true, if email is empty
     * */
    isEmailEmpty(): boolean {
        return this.state.email === '';
    }

    /**
     * @return true, if entered email format is valid
     * */
    isEmailValid(): boolean {
        const email = this.state.email;
        let regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regexEmail.test(email);
    }

    render(): ReactNode {
        return (
            <View style={this.props.style}>
                <TextInput
                    style={globalStyle.formElemSpacing}
                    mode={'outlined'}
                    label='Email'
                    value={this.state.email}
                    dense={true}
                    onChangeText={(val) => this.onChange(val)}
                    disabled={this.props.disabled}
                    keyboardType={'email-address'}
                    onBlur={() => this.updateParent()}
                />
                <HelperText
                    type='error'
                    visible={this.showErrorMessage()}
                    style={
                        this.showErrorMessage() ? '' : globalStyle.hiddenMessage
                    }>
                    - Mail is invalid!
                </HelperText>
            </View>
        );
    }
}
