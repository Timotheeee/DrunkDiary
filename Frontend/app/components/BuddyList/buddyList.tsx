import React, {ReactNode} from 'react';
import {Text, View} from 'react-native';
import {IconButton, List, Snackbar, TouchableRipple} from 'react-native-paper';
import {displayMessage} from '../Helper/helper';
import UserIcon from '../UserIcon/userIcon';
import style from './styles';
import globalStyle from '../../../assets/globalStyles';
import {
    removeBuddy,
    removeBuddyFromCurrentUser,
} from '../Helper/buddyManagement';

type Props = {
    buddies: Buddy[];
    email: string;
};

type State = {
    expanded: boolean;
    snackBar: SnackBar;
};
const snackBarDurationInMS: number = 2000;

export default class BuddyList extends React.Component<Props, State> {
    props: Props;

    state: State = {
        expanded: true,
        snackBar: {visible: false, msg: ''},
    };

    /**
     * Expands/collapses the BuddyList
     */
    toggleAccordion(): void {
        this.setState({expanded: !this.state.expanded});
    }

    /**
     * After the buddy has been sent to the backend, this function is called.
     * Removes specified buddy from props.buddies and from CurrentUser via removeBuddyFromCurrentUser
     * @param buddy to remove from props.buddies
     */
    onRemove(buddy: Buddy): Function {
        let buddies = this.props.buddies;
        const index = buddies.indexOf(buddy);
        if (index > -1) {
            buddies.splice(index, 1);
            removeBuddyFromCurrentUser(buddy);
        }
        return displayMessage('User was deleted from your buddies.').bind(this);
    }

    render(): ReactNode {
        let boundRemoveBuddy: Function = removeBuddy.bind(this);
        return (
            <List.Accordion
                title='My Buddies'
                expanded={this.state.expanded}
                onPress={() => this.toggleAccordion()}>
                {this.props.buddies.map(function (buddy, index: number) {
                    return (
                        <TouchableRipple
                            onPress={() =>
                                boundRemoveBuddy(
                                    this.props.email,
                                    buddy.name,
                                    this.onRemove(buddy),
                                    displayMessage(
                                        'An error occurred during the the removing process',
                                    ),
                                )
                            }
                            rippleColor='rgba(0, 0, 0, .32)'
                            key={index}>
                            <View style={[globalStyle.row, style.item]}>
                                <UserIcon
                                    name={buddy.name}
                                    color={buddy.color}
                                />
                                <Text style={style.name}>{buddy.name}</Text>
                                <IconButton icon={'account-minus'} size={24} />
                            </View>
                        </TouchableRipple>
                    );
                }, this)}
                <Snackbar
                    visible={this.state.snackBar.visible}
                    duration={snackBarDurationInMS}
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
            </List.Accordion>
        );
    }
}
