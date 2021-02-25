import React, {ReactNode} from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import {ScrollView, View, Image, Slider} from 'react-native';
import {
    Button,
    Caption,
    Card,
    Snackbar,
    Switch,
    TextInput,
} from 'react-native-paper';
import {Region} from 'react-native-maps';
import PinDetails from './pinDetails';
import globalStyles from '../../../assets/globalStyles';
import styles from './styles';

const server = require('../../../config').server;
const apiPin = require('../../../config').apiPin;

type Props = {
    id: string;
    location: Region;
    userName: string;
    email: string;
    loadMarkers: any;
};

type State = {
    id: string;
    title: string;
    description: string;
    imgSource: any;
    hoursValid: number;
    percentCompleted: number;
    private: boolean;
};

const createUrl: string = server + apiPin + '/create';

/**
 * This class implements the functionality of a pin.
 */
export default class Pin extends React.Component<Props, State> {
    /**
     * Binds savePin method to pin component.
     * @param props Properties
     */
    constructor(props) {
        super(props);
        this.savePin = this.savePin.bind(this);
    }

    state: State = {
        id: this.props.id,
        title: '',
        description: '',
        imgSource: null,
        hoursValid: 2,
        percentCompleted: null,
        private: false,
    };

    /**
     * Saves the pin and updates pins on the map.
     * If saving the pin fails, the user will be notified.
     */
    savePin(): void {
        // All request data is sent in multipart/form-data format to accommodate larger image files
        let formData = new FormData();
        formData.append('title', this.state.title);
        formData.append('lat', this.props.location.latitude.toString());
        formData.append('lng', this.props.location.longitude.toString());
        formData.append('description', this.state.description);
        formData.append('host', this.props.userName);
        formData.append('private', this.state.private.toString());
        formData.append('hoursValid', this.state.hoursValid.toString());
        if (this.state.imgSource) {
            formData.append(
                'photo',
                JSON.parse(
                    JSON.stringify({
                        uri: this.state.imgSource.uri,
                        type: 'image/jpeg',
                        name: 'test.jpg',
                    }),
                ),
            );
        }

        // Tracks how much upload progress was completed and saves that in the state
        const config = {
            onUploadProgress: (progressEvent) => {
                let percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                );
                console.log('Progress is: ' + percentCompleted + '%');
                this.setState({percentCompleted: percentCompleted});
            },
        };

        // POST request which triggers a reload of all markers when completed
        axios
            .post(createUrl, formData, config)
            .then(
                function (res) {
                    this.props.loadMarkers();
                    this.setState({id: res.data});
                }.bind(this),
            )
            .catch(function (error) {
                console.log(error);
                alert('Oops');
            });
    }

    /**
     * Allows the user to pick an image from their phone's gallery.
     */
    async pickImage(): Promise<void> {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            if (result.cancelled) {
                console.log('Image upload was cancelled');
                this.setState({imgSource: null});
            } else {
                this.setState({imgSource: result});
            }
        } catch (E) {
            console.log(E);
        }
    }

    /**
     * Checks whether the title of a pin is valid.
     * If it is not, the user will be notified. Otherwise, the pin will be saved.
     */
    checkWhetherPinIsValid(): void {
        let minLength: number = 3;
        if (
            this.state.title === '' ||
            (this.state.title !== '' && this.state.title.length < minLength)
        ) {
            alert('The title of your pin must contain at least three letters.');
        } else {
            this.savePin();
        }
    }

    render(): ReactNode {
        return (
            <ScrollView>
                {this.state.id === '' ? (
                    <View style={{flex: 1}}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                            <TextInput
                                style={[
                                    globalStyles.formElemSpacing,
                                    {width: '75%'},
                                ]}
                                mode={'outlined'}
                                label={'Title'}
                                dense={true}
                                value={this.state.title}
                                onChangeText={(title) =>
                                    this.setState({title: title})
                                }
                            />
                            <View
                                style={[
                                    globalStyles.formElemSpacing,
                                    {
                                        width: '25%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}>
                                <Caption>
                                    {this.state.private ? 'Private' : 'Public'}
                                </Caption>
                                <Switch
                                    value={this.state.private}
                                    onValueChange={() =>
                                        this.setState({
                                            private: !this.state.private,
                                        })
                                    }
                                />
                            </View>
                        </View>
                        <TextInput
                            style={globalStyles.formElemSpacing}
                            mode={'outlined'}
                            label={'Description'}
                            multiline={true}
                            value={this.state.description}
                            placeholder={'Describe what your pin is about'}
                            onChangeText={(desc) =>
                                this.setState({description: desc})
                            }
                        />
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                            <TextInput
                                style={[
                                    globalStyles.formElemSpacing,
                                    {width: '30%'},
                                ]}
                                mode={'outlined'}
                                label={'Host'}
                                dense={true}
                                value={this.props.userName}
                                editable={false}
                                disabled
                            />
                            <View
                                style={[
                                    globalStyles.formElemSpacing,
                                    {
                                        width: '70%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}>
                                <Caption>
                                    Pin will be valid for{' '}
                                    {this.state.hoursValid} hours.
                                </Caption>
                                <Slider
                                    style={{width: '100%'}}
                                    minimumValue={1}
                                    maximumValue={12}
                                    step={1}
                                    value={2}
                                    onValueChange={(hours) =>
                                        this.setState({hoursValid: hours})
                                    }
                                />
                            </View>
                        </View>
                        <Card
                            style={styles.placeholder}
                            onPress={() => this.pickImage()}>
                            {this.state.imgSource ? (
                                <Image
                                    source={{uri: this.state.imgSource.uri}}
                                    style={{
                                        height: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                />
                            ) : (
                                <Button
                                    style={{paddingVertical: '30%'}}
                                    icon={'image-filter'}
                                    onPress={() => this.pickImage()}>
                                    Upload picture
                                </Button>
                            )}
                        </Card>
                        <Button onPress={() => this.checkWhetherPinIsValid()}>
                            Create Pin
                        </Button>
                        <Snackbar
                            visible={this.state.percentCompleted != null}
                            onDismiss={null}>
                            Uploading: {this.state.percentCompleted}%
                        </Snackbar>
                    </View>
                ) : (
                    <PinDetails
                        pinId={this.state.id}
                        email={this.props.email}
                    />
                )}
            </ScrollView>
        );
    }
}
