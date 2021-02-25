import React, {ReactNode} from 'react';
import {FlatList, Text, View} from 'react-native';
import {Button, Divider, Headline, Title} from 'react-native-paper';
import RoomPlayer from './roomPlayer';
import globalStyle from '../../../assets/globalStyles';
import style from './styles';
import {buddyArrayContainsName} from '../Helper/buddyManagement';

type Props = {
    partyCode: number;
    roomName: string;
    players: {name: string}[];
    buddies: Buddy[];
    start: Function;
    kick: Function;
    end: Function;
    leave: Function;
    addBuddy: Function;
    isHost: boolean;
    ownName: string;
    ownEmail: string;
};

export default class Room extends React.Component<Props> {
    props: Props;

    render(): ReactNode {
        return (
            <View style={globalStyle.containerPadding}>
                <Headline>Room Name: {this.props.roomName}</Headline>
                <Title>Party Code: {this.props.partyCode}</Title>
                <Divider style={style.divider} />
                <Text style={globalStyle.formElemSpacing}>
                    List of players:
                </Text>
                <FlatList
                    style={globalStyle.formElemSpacing}
                    data={this.props.players}
                    renderItem={({item}) => (
                        <RoomPlayer
                            name={item.name}
                            partyCode={this.props.partyCode}
                            kick={this.props.kick}
                            addBuddy={this.props.addBuddy}
                            isHost={this.props.isHost}
                            isBuddy={buddyArrayContainsName(
                                this.props.buddies,
                                item.name,
                            )}
                            ownName={this.props.ownName}
                            ownEmail={this.props.ownEmail}
                        />
                    )}
                    keyExtractor={(item) => item.name}
                />
                {this.props.isHost ? (
                    <View>
                        <Button
                            mode='contained'
                            onPress={() => this.props.start()}>
                            Start my party
                        </Button>
                        <Button
                            mode='outlined'
                            onPress={() => this.props.end(this.props.partyCode)}
                            style={globalStyle.formElemSpacing}>
                            End current room
                        </Button>
                    </View>
                ) : (
                    <Button
                        mode='outlined'
                        onPress={() => this.props.leave(this.props.partyCode)}
                        style={globalStyle.formElemSpacing}>
                        Leave room
                    </Button>
                )}
            </View>
        );
    }
}
