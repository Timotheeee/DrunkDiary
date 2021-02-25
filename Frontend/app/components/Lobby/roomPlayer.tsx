import React, {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import style from './styles';
import globalStyle from '../../../assets/globalStyles';
import {displayMessage} from '../Helper/helper';
import {addBuddyToCurrentUser} from '../Helper/buddyManagement';

type Props = {
    name: string;
    partyCode: number;
    kick: Function;
    addBuddy: Function;
    isHost: boolean;
    isBuddy: boolean;
    ownName: string;
    ownEmail: string;
};

type State = {
    isBuddy: boolean;
};

export default class roomPlayer extends React.Component<Props> {
    props: Props;

    state: State = {
        isBuddy: this.props.isBuddy,
    };

    /**
     * Adds the selected user to buddies and displays a message to the user.
     * @param {Buddy} buddy - Reference to the buddy to add to buddies.
     */
    onAdd(buddy: Buddy): Function {
        if (!this.state.isBuddy) {
            this.setState({isBuddy: true});
            addBuddyToCurrentUser(buddy);
        }
        return displayMessage('User was added to your buddies.');
    }

    render(): ReactNode {
        return (
            <View style={[globalStyle.row, style.item]}>
                <Text style={style.name}>{this.props.name}</Text>
                {this.props.name !== this.props.ownName && (
                    <View style={globalStyle.row}>
                        {!this.state.isBuddy && (
                            <Button
                                mode={'outlined'}
                                onPress={() =>
                                    //bound at lobby level
                                    this.props.addBuddy(
                                        this.props.ownEmail,
                                        this.props.name,
                                        this.onAdd({
                                            name: this.props.name,
                                            color: '#dd2c00',
                                        }),
                                        displayMessage(
                                            'An error occurred during the the adding process',
                                        ),
                                    )
                                }>
                                Add
                            </Button>
                        )}
                        {this.props.isHost && (
                            <Button
                                mode={'outlined'}
                                onPress={() =>
                                    this.props.kick(
                                        this.props.name,
                                        this.props.partyCode,
                                    )
                                }>
                                Kick
                            </Button>
                        )}
                    </View>
                )}
            </View>
        );
    }
}
