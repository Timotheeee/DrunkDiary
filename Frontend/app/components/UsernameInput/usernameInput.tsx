import React, {ReactNode} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';

type Props = {
    username: string;
    disabled?: boolean;
    validate?: boolean;
    onChange?: (type: string, val: string) => void;
    style?: StyleProp<ViewStyle>;
};

type State = {
    username: string;
    isValid: boolean;
};

export default class UsernameInput extends React.Component<Props, State> {
    public static defaultProps: Partial<Props> = {
        disabled: false,
        validate: true,
        onChange: (type: string, val: string) => {},
    };

    state: State = {
        username: this.props.username,
        isValid: false,
    };

    componentDidMount(): void {
        this.validate();
    }

    /**
     * update state value of "username" on change
     * @param val: new value
     * */
    onChange(val: string): void {
        this.setState({username: val});
    }

    /**
     * pass the username to the parent component
     * */
    updateParent(): void {
        this.validate();
        this.props.onChange('username', this.state.username);
    }

    /**
     * sets the state "valid" to true if:
     *  - username not empty
     *  - username is not too short
     *  - username contains only alphanumeric characters
     * */
    validate(): void {
        let valid =
            !this.isUsernameEmpty() &&
            !this.isUsernameIsTooShort() &&
            !this.hasUsernameSpecialCharacters();
        this.setState({isValid: valid});
    }

    /**
     * check if username is empty
     * @return {boolean} true, if username is empty
     * */
    isUsernameEmpty(): boolean {
        return this.state.username == '';
    }

    /**
     * check length of username
     * @return {boolean} true, if username has less than 3 characters
     * */
    isUsernameIsTooShort(): boolean {
        const {username} = this.state;
        let regExp_UsernameMIN3 = /^.{3,}$/;
        return (
            !regExp_UsernameMIN3.test(username) &&
            !this.isUsernameEmpty() &&
            this.props.validate
        );
    }

    /**
     * check special characters
     * @return {boolean} true, if username contains special characters
     * */
    hasUsernameSpecialCharacters(): boolean {
        const {username} = this.state;
        let regExp_Username = /^[a-zA-Z0-9]+$/;
        return (
            !regExp_Username.test(username) &&
            !this.isUsernameEmpty() &&
            this.props.validate
        );
    }

    render(): ReactNode {
        return (
            <View style={this.props.style}>
                <TextInput
                    style={globalStyle.formElemSpacing}
                    mode={'outlined'}
                    disabled={this.props.disabled}
                    label='Username'
                    value={this.state.username}
                    onChangeText={(val) => this.onChange(val)}
                    dense={true}
                    onBlur={() => this.updateParent()}
                />
                <HelperText
                    type='error'
                    visible={this.hasUsernameSpecialCharacters()}
                    style={
                        this.hasUsernameSpecialCharacters()
                            ? ''
                            : globalStyle.hiddenMessage
                    }>
                    - Username should not contain special characters and umlauts
                </HelperText>
                <HelperText
                    type='error'
                    visible={this.isUsernameIsTooShort()}
                    style={
                        this.isUsernameIsTooShort()
                            ? ''
                            : globalStyle.hiddenMessage
                    }>
                    - Username is to short (min. 3 characters)
                </HelperText>
            </View>
        );
    }
}
