import React, {ReactNode} from 'react';
import {FlatList, Text, View} from 'react-native';
import {Button, Divider, IconButton, Provider as PaperProvider, Subheading, Title} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';
import style from './styles';

type Props = {
    list: string[];
    points: number;
    sendGift: (list: {name: string; count: number}[]) => void;
};

type State = {
    list: {
        name: string;
        count: number;
    }[];
    myPoints: number;
    answerSent: boolean;
};

export default class SecretSanta extends React.Component<Props, State> {
    props: Props;

    state: State = {
        list: [],
        myPoints: this.props.points,
        answerSent: false,
    };

    constructor(props: Props) {
        super(props);
    }

    componentDidMount(): void {
        this.setInitialState();
    }

    setInitialState(): void {
        let nameList = this.props.list.map((name) => {
            return {name: name, count: 0};
        });
        this.setState({list: nameList});
    }

    distributeGift(item: {name: string, count: number}, gift: number) {
        item.count += gift;

        const newList = this.state.list.map(curName => {
            if (curName.name === item.name) {
                return item;
            }
            return curName;
        });

        this.setState({list: newList});
        this.setState({myPoints: this.state.myPoints + (gift * -1)});
    }

    sendGift(): void {
        if (!this.state.answerSent) {
            console.log('send gift');
            this.setState({answerSent: true});
            this.props.sendGift(this.state.list);
        }
    }

    render(): ReactNode {
        return (
            <PaperProvider>
                {!this.state.answerSent ? (
                        <View style={[style.fill, globalStyle.column]}>
                            <Title>Secret Santa</Title>
                            <Subheading>Remaining gifts to distribute: {this.state.myPoints}</Subheading>
                            <FlatList
                                data={this.state.list}
                                style={[globalStyle.formElemSpacing, style.fill]}
                                keyExtractor={(item) => item.name}
                                ItemSeparatorComponent={Divider}
                                renderItem={({item}) => (
                                    <View style={globalStyle.row}>
                                        <Text style={style.fill}>{item.name}</Text>
                                        <Text style={{paddingRight: 20}}>{item.count}</Text>
                                        <IconButton icon="minus" disabled={item.count <= 0} size={25}
                                                    onPress={() => this.distributeGift(item, -1)}/>
                                        <IconButton icon="plus" disabled={this.state.myPoints <= 0} size={25}
                                                    onPress={() => this.distributeGift(item, 1)}/>
                                    </View>
                                )}/>
                            <Button mode={'contained'} style={style.submitButton}
                                    onPress={() => this.sendGift()}>Send Gift</Button>
                        </View>
                    ) :
                    <Subheading style={style.msg}>
                        Please wait until your colleagues have distributed all the gifts.
                    </Subheading>
                }
            </PaperProvider>
        );
    }
}
