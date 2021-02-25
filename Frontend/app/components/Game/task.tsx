import React, {ReactNode} from 'react';
import {ScrollView, Text, View} from 'react-native';
import style from './styles';
import {Button, Portal, Provider as PaperProvider, RadioButton, Snackbar, TextInput, Title,} from 'react-native-paper';
import globalStyle from '../../../assets/globalStyles';

type Props = {
    roomName: string;
    task: {
        type: string;
        title: string;
        score: number;
        task: string;
        options: any;
    };
    sendAnswer?: (answer: string) => void;
    nextTask?: () => void;
};

type State = {
    answer: string;
    snackBar: {visible: boolean; msg: string};
    answerSent: boolean;
};

export default class Task extends React.Component<Props, State> {
    props: Props;

    state: State = {
        answer: '',
        snackBar: {visible: false, msg: ''},
        answerSent: false,
    };

    constructor(props: Props) {
        super(props);
    }

    submitAnswer(val: string): void {
        if (!this.state.answerSent) {
            this.setState({answer: val});
            this.setState({answerSent: true});
            this.setState({snackBar: {visible: true, msg: 'successfully submitted your answer!'}});
            this.props.sendAnswer(val);
        }
    }

    renderAnswerType(): ReactNode {
        switch (this.props.task.type) {
            case 'voteForPlayer':
                return this.renderUsers();
            case 'MultyChoice':
                return this.renderOptions();
            case 'A or B':
                return this.renderAorB();
            case 'Input':
                return this.renderInput();
            case 'closestNumber':
                return this.renderNumberInput();
            default:
                return (
                    <Button mode={'contained'} style={{marginTop: 40}} onPress={() => this.props.nextTask()}>
                        I'm ready for the next task!
                    </Button>
                );
        }
    }

    renderUsers(): ReactNode {
        let list = [];
        Object.keys(this.props.task.options).forEach((user, key) =>
            list.push(<RadioButton.Item label={user} value={user} key={key}/>),
        );

        return (
            <RadioButton.Group value={this.state.answer} onValueChange={(val) => this.submitAnswer(val)}>
                {list}
            </RadioButton.Group>
        );
    }

    renderOptions(): ReactNode {
        return (
            <RadioButton.Group value={this.state.answer} onValueChange={(val) => this.submitAnswer(val)}>
                <RadioButton.Item label={this.props.task.options.A} value='A'/>
                <RadioButton.Item label={this.props.task.options.B} value='B'/>
                <RadioButton.Item label={this.props.task.options.C} value='C'/>
                <RadioButton.Item label={this.props.task.options.D} value='D'/>
            </RadioButton.Group>
        );
    }

    renderAorB(): ReactNode {
        return (
            <RadioButton.Group value={this.state.answer} onValueChange={(val) => this.submitAnswer(val)}>
                <RadioButton.Item label={this.props.task.options.A} value='A'/>
                <RadioButton.Item label={this.props.task.options.B} value='B'/>
            </RadioButton.Group>
        );
    }

    renderInput(): ReactNode {
        return (
            <View style={globalStyle.row}>
                <TextInput
                    mode={'outlined'}
                    dense={true}
                    label={'Your Answer'}
                    style={style.inputStyle}
                    onChangeText={(val) => this.setState({answer: val})}
                    value={this.state.answer}
                />
                <Button style={style.submit} mode={'contained'} onPress={() => this.submitAnswer(this.state.answer)}>
                    Submit
                </Button>
            </View>
        );
    }

    renderNumberInput(): ReactNode {
        return (
            <View style={globalStyle.row}>
                <TextInput
                    mode={'outlined'}
                    dense={true}
                    label={'Your Answer'}
                    style={style.inputStyle}
                    keyboardType={'number-pad'}
                    onChangeText={(val) => this.setState({answer: val})}
                    value={this.state.answer}
                />
                <Button style={style.submit} mode={'contained'} onPress={() => this.submitAnswer(this.state.answer)}>
                    Submit
                </Button>
            </View>
        );
    }

    render(): ReactNode {
        return (
            <PaperProvider>
                <View>
                    <View>
                        <Title>{this.props.roomName}</Title>
                        {/* Task */}
                        <View style={globalStyle.formElemSpacing}>
                            <Title>{this.props.task.title || 'no Title'}</Title>
                            <Text style={globalStyle.formElemSpacing}>{this.props.task.task}</Text>
                        </View>
                        <View style={[globalStyle.formElemSpacing]}>
                            <ScrollView>{this.renderAnswerType()}</ScrollView>
                        </View>
                    </View>
                    <Portal>
                        <Snackbar
                            visible={this.state.snackBar.visible}
                            duration={3000}
                            onDismiss={() =>
                                this.setState({
                                    snackBar: {visible: false, msg: ''},
                                })
                            }>
                            {this.state.snackBar.msg}
                        </Snackbar>
                    </Portal>
                </View>
            </PaperProvider>
        );
    }
}
