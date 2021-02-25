import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {Button, Provider as PaperProvider, Text,} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';
import Task from './task';
import TaskResult from './taskResult';
import SecretSanta from './secretSanta';
import SantasDelivery from './santasDelivery';

type Props = {
    userName: string;
    roomName: string;
    socket: any;
};

type State = {
    screen: string;
    task: {
        type: string;
        title: string;
        score: number;
        task: string;
        options: any;
    };
    result: string;
    userList: string[];
    points: number;
    deliveryList: {
        user: string;
        count: number;
    }[];
};

const screen = {
    task: 'Task',
    result: 'Result',
    secretSanta: 'Secret Santa',
    delivery: 'Santas delivery',
};

export default class Game extends React.Component<Props, State> {
    props: Props;

    state: State = {
        screen: '',
        task: {
            type: '',
            title: '',
            score: 0,
            task: '',
            options: null,
        },
        result: '',
        userList: [],
        points: 0,
        deliveryList: [],
    };

    constructor(props: Props) {
        super(props);
        this.props.socket.on('task', (res) => this.startNewTask(res));
        this.props.socket.on('resultEvaluated', (res) => this.showResult(res));
        this.props.socket.on('secretSanta', (res) => this.distributeGifts(res));
        this.props.socket.on('santasDelivery', (res) => this.deliverGifts(res));
    }

    renderScreen(): ReactNode {
        switch (this.state.screen) {
            case screen.task:
                return (<Task task={this.state.task} roomName={this.props.roomName}
                              nextTask={() => this.readyForNextTask()}
                              sendAnswer={(answer) => this.submitAnswer(answer)}/>);
            case screen.result:
                return <TaskResult result={this.state.result} nextTask={() => this.readyForNextTask()}/>;
            case screen.secretSanta:
                return <SecretSanta list={this.state.userList} points={this.state.points}
                                    sendGift={(data) => this.sendGift(data)}/>;
            case screen.delivery:
                return <SantasDelivery list={this.state.deliveryList} nextTask={() => this.readyForNextTask()}/>;
            default:
                return <Text/>;
        }
    }

    /**************** Task *****************/
    startNewTask(task: any): void {
        this.setState({task: task});
        this.setState({screen: screen.task});
    }

    submitAnswer(answer: string): void {
        let vote = {name: this.props.userName, vote: answer};
        console.log('emit vote: ', vote);
        this.props.socket.emit('vote', vote);
    }

    /************* Task Result *************/
    showResult(res): void {
        this.setState({result: res});
        this.setState({screen: screen.result});
    }

    readyForNextTask(): void {
        console.log('emit nextTask');
        this.props.socket.emit('nextTask');
    }

    /************  Secret Santa ************/
    distributeGifts(res): void {
        let nameList = res.map((item) => {
            if (item.user === this.props.userName) {
                this.setState({points: item.points});
            }
            return item.user;
        });

        this.setState({userList: nameList});
        this.setState({screen: screen.secretSanta});
    }

    sendGift(data: {user: string; count: number}[]): void {
        let gift = {name: this.props.userName, presents: data};
        console.log('emit sendGift: ', gift);
        this.props.socket.emit('sendGift', gift);
    }

    /*********** Santas delivery ***********/
    deliverGifts(list): void {
        this.setState({deliveryList: list});
        this.setState({screen: screen.delivery});
    }

    render(): ReactNode {
        return (
            <PaperProvider>
                <View style={globalStyle.containerPadding}>
                    {this.renderScreen()}
                </View>
            </PaperProvider>
        );
    }
}
