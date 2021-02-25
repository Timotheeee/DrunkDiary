import React, {ReactNode} from 'react';
import {Text, View} from 'react-native';
import style from './styles';
import {Button, Portal, Provider as PaperProvider, Snackbar, Title,} from 'react-native-paper';

type Props = {
    result: string;
    nextTask: () => void;
};

type State = {
    snackBar: {visible: boolean; msg: string};
    isReady: boolean;
};

export default class TaskResult extends React.Component<Props, State> {
    props: Props;

    state: State = {
        snackBar: {visible: false, msg: ''},
        isReady: false,
    };

    constructor(props: Props) {
        super(props);
    }

    onReady(): void {
        if (!this.state.isReady) {
            this.setState({isReady: true});
            this.setState({snackBar: {visible: true, msg: 'Please wait until your colleagues are ready.'}});
            this.props.nextTask();
        }
    }

    render(): ReactNode {
        return (
            <PaperProvider>
                <View style={style.fill}>
                    <View style={style.fill}>
                        <Title style={style.resultContainer}>{this.props.result}</Title>
                        {!this.state.isReady ? (
                            <Button mode={'contained'} style={style.submitButton} onPress={() => this.onReady()}>
                                I'm ready for the next task!
                            </Button>
                        ) : (
                            <Text>Please wait until everyone is ready.</Text>
                        )}
                    </View>
                    <Portal>
                        <Snackbar visible={this.state.snackBar.visible} duration={3000}
                                  onDismiss={() => this.setState({snackBar: {visible: false, msg: ''}})}>
                            {this.state.snackBar.msg}
                        </Snackbar>
                    </Portal>
                </View>
            </PaperProvider>
        );
    }
}
