import React, {ReactNode} from 'react';
import axios from 'axios';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Divider,
    TextInput,
    Title,
} from 'react-native-paper';

import style from './styles';
import UserIcon from '../UserIcon/userIcon';

const server = require('../../../config').server;
const apiPin = require('../../../config').apiPin;
const imagePath = require('../../../config').imagePath;

type Props = {
    pinId: string;
    email: string;
};

type State = {
    details: {
        title: string;
        description: string;
        imgPath: string;
    };
    commentBox: any;
    comment: string;
    scrollView: any;
};

const pinUrl = server + apiPin + '/getPin/';
const commentsUrl = server + apiPin + '/getComments/';
const newCommentUrl = server + apiPin + '/addComment';

/**
 * This class handles the details of a pin.
 */
export default class PinDetails extends React.Component<Props, State> {
    props: Props;

    state: State = {
        details: {title: '', description: '', imgPath: ''},
        commentBox: [],
        comment: '',
        scrollView: null,
    };
    private commentPoller: any;

    UNSAFE_componentWillMount() {
        this.loadPin();
        this.commentPoller = setInterval(() => {
            this.loadComments();
        }, 10 * 1000);
    }

    componentWillUnmount(): void {
        clearInterval(this.commentPoller);
    }

    /**
     * Loads a pin and its comments onto the map.
     */
    loadPin(): void {
        axios
            .get(pinUrl + this.props.pinId)
            .then(
                function (response) {
                    response.data.commentBox = response.data.commentBox.reverse();
                    this.setState({
                        details: response.data,
                        commentBox: response.data.commentBox,
                    });
                }.bind(this),
            )
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * Loads the comments of a pin.
     */
    loadComments(): void {
        axios
            .get(commentsUrl + this.props.pinId)
            .then(
                function (response) {
                    response.data.commentBox = response.data.commentBox.reverse();
                    this.setState({commentBox: response.data.commentBox});
                }.bind(this),
            )
            .catch(function (error) {
                console.log(error);
            });
    }

    /**
     * Adds a comment to a pin, if the comment is not empty.
     * Otherwise, the user will be notified.
     */
    addComment(): void {
        if (this.state.comment) {
            axios
                .post(newCommentUrl, {
                    id: this.props.pinId,
                    commentBox: [
                        {
                            commenter: this.props.email,
                            comment: this.state.comment,
                        },
                    ],
                })
                .then(
                    function (response) {
                        this.loadComments();
                    }.bind(this),
                )
                .catch(function (error) {
                    console.log(error);
                    alert('Oops');
                });
            this.setState({comment: ''});
        } else {
            alert('Please fill out all fields');
        }
    }

    render(): ReactNode {
        return (
            <View>
                {this.state.details.title ? (
                    <KeyboardAvoidingView
                        style={{flex: 1}}
                        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
                        <Title>{this.state.details.title || 'no Title'}</Title>
                        <Text>
                            {this.state.details.description || 'no Description'}
                        </Text>
                        {this.state.details.imgPath != '' && (
                            <Image
                                source={{
                                    uri:
                                        server +
                                        imagePath +
                                        this.state.details.imgPath,
                                }}
                                style={style.pinImage}
                            />
                        )}
                        <View style={style.newComment}>
                            <TextInput
                                label="Comment"
                                value={this.state.comment}
                                dense={true}
                                mode={'outlined'}
                                style={{flex: 1}}
                                maxLength={100}
                                onChangeText={(text) =>
                                    this.setState({comment: text})
                                }
                            />
                            <Button onPress={() => this.addComment()}>
                                Send
                            </Button>
                        </View>
                        <ScrollView>
                            {this.state.commentBox.map((elem, key) => {
                                let commenter = JSON.parse(elem.commenter);
                                return (
                                    <View key={key}>
                                        <Divider />
                                        <View style={style.row}>
                                            <UserIcon
                                                name={commenter.name}
                                                color={commenter.color}
                                            />
                                            <Text style={style.message}>
                                                {elem.comment}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </KeyboardAvoidingView>
                ) : (
                    <View style={style.activityIndicatorBox}>
                        <ActivityIndicator
                            size="large"
                            style={style.activityIndicator}
                        />
                        <Text>Loading pin details...</Text>
                    </View>
                )}
            </View>
        );
    }
}
