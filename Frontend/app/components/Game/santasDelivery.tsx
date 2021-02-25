import React, {ReactNode} from 'react';
import {FlatList, Text, View} from 'react-native';
import {Button, Divider, Provider as PaperProvider, Subheading, Title} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';
import style from './styles';

type Props = {
    list: {
        user: string;
        count: number;
    }[];
    nextTask: () => void;
};

type State = {
    answerSent: boolean;
};

export default class SantasDelivery extends React.Component<Props, State> {
    props: Props;

    state: State = {
        answerSent: false
    };

    constructor(props: Props) {
        super(props);
    }

    readyForNextRound(): void {
        if (!this.state.answerSent) {
            console.log('got delivery & ready for next Task');
            this.setState({answerSent: true});
            this.props.nextTask();
        }
    }

    render(): ReactNode {
        return (
            <PaperProvider>
                {!this.state.answerSent ?
                    <View style={[style.fill, globalStyle.column]}>
                        <Title>Santa's delivery</Title>
                        <View style={style.fill}>
                            <FlatList
                                data={this.props.list}
                                style={[globalStyle.formElemSpacing, style.fill]}
                                keyExtractor={(item) => item.user}
                                ItemSeparatorComponent={Divider}
                                renderItem={({item}) => (
                                    <View style={globalStyle.row}>
                                        <Text style={[style.deliveryItem, style.fill]}>{item.user}</Text>
                                        <Text style={style.deliveryItem}>{item.count}</Text>
                                    </View>
                                )}
                            />
                        </View>
                        <Button mode={'contained'} style={style.submitButton}
                                onPress={() => this.readyForNextRound()}>I'm ready for the next round!</Button>
                    </View>
                    :
                    <Subheading style={style.msg}>
                        Please wait until your colleagues are ready.
                    </Subheading>
                }
            </PaperProvider>
        );
    }
}
