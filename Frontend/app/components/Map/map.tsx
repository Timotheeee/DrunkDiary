import React, {ReactNode} from 'react';
import MapView, {EventUserLocation, Marker, Region} from 'react-native-maps';
import {Alert, Slider, View} from 'react-native';
import {
    Caption,
    Dialog,
    FAB,
    Portal,
    Provider as PaperProvider,
    Subheading,
    Switch,
    Title,
} from 'react-native-paper';
import styles from './styles';
import Pin from './pin';
import axios from 'axios';
import globalStyles from '../../../assets/globalStyles';
import {buddyArrayContainsName} from '../Helper/buddyManagement';
import {navigateTo} from '../Helper/helper';

type Props = {
    route: any;
};

type State = {
    userName: string;
    email: string;
    currentPosition: Region;
    tracking: boolean;
    popupVisible: boolean;
    settingsVisible: boolean;
    currentPin: string;
    markers: any;
    buddiesOnly: boolean;
    radiusInMeter: number;
};

type ZoomLevel = {latitudeDelta: number; longitudeDelta: number};
type UserLocation = {latitude: number; longitude: number};

const server = require('../../../config').server;
const apiPin = require('../../../config').apiPin;
const apiGetPinsNear: string = server + apiPin + '/getPinsNear/';
const IMAGE_PATH_PIN: string = '../../../assets/logo_app_pin_scaledv2.png';
const IMAGE_PATH_BUDDY_PIN: string =
    '../../../assets/logo_app_pin_scaledv2_purple.png';
const ANIMATION_DURATION_MS: number = 1000;
const TIMEOUT_IN_MILLISECS: number = 60 * 1000;
const INITIAL_RADIUS_IN_METER: number = 5000;
const COLOR_BUTTON_PRESSED: string = 'royalblue';
const COLOR_BUTTON_UNPRESSED: string = 'grey';
const MAP_ZOOM_LEVEL: ZoomLevel = {latitudeDelta: 0.02, longitudeDelta: 0.02};
const INITIAL_MAP_ZOOM_LEVEL: ZoomLevel = {
    latitudeDelta: MAP_ZOOM_LEVEL.latitudeDelta * 10,
    longitudeDelta: MAP_ZOOM_LEVEL.longitudeDelta * 10,
};
/**
 * This class implements the map.
 */
export default class Map extends React.Component<Props, State> {
    private mapView: MapView;
    private markerPoller: NodeJS.Timeout;

    /**
     * Binds loadMarkers method to map component.
     * @param props Properties
     */
    constructor(props) {
        super(props);
        this.loadMarkers = this.loadMarkers.bind(this);
    }

    state: State = {
        userName: this.props.route.params.name,
        email: this.props.route.params.email,
        currentPosition: {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0,
            longitudeDelta: 0,
        },
        tracking: false,
        popupVisible: false,
        settingsVisible: false,
        currentPin: '',
        markers: [],
        buddiesOnly: false,
        radiusInMeter: INITIAL_RADIUS_IN_METER,
    };

    componentWillUnmount(): void {
        if (this.markerPoller) {
            clearInterval(this.markerPoller);
        }
    }

    /**
     * Prepares the map for the user by locating the user and loading pins.
     * Assumption: User has turned on their GPS and permitted access to use location services.
     * If an error occurs while preparing, the user will be notified and navigated back
     * to main page.
     */
    onMapReady(): void {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
            (position: Position) => {
                let location: UserLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                this.setUserLocation(location, INITIAL_MAP_ZOOM_LEVEL);
                this.changeToUserLocation();
                this.loadMarkers();
                this.markerPoller = setInterval(() => {
                    this.loadMarkers();
                }, TIMEOUT_IN_MILLISECS);
            },
            (error: PositionError) => {
                switch (error.code) {
                    // @ts-ignore, several IDEs warn that error.code is actually should be a number and not a string, but this can be safely ignored
                    case 'E_LOCATION_UNAUTHORIZED':
                        Alert.alert(
                            'Permission denied',
                            'The DrunkDiary map can only be accessed if you permit access to location services.',
                        );
                        break;
                    // @ts-ignore, several IDEs warn that error.code is actually should be a number and not a string, but this can be safely ignored
                    case 'E_NO_PERMISSIONS':
                        Alert.alert(
                            'Permission denied',
                            'The DrunkDiary map can only be accessed if you permit access to location services.',
                        );
                        break;
                    // @ts-ignore, several IDEs warn that error.code is actually should be a number and not a string, but this can be safely ignored
                    case 'E_LOCATION_SETTINGS_UNSATISFIED':
                        Alert.alert(
                            'Location disabled',
                            'Your location services are disabled but they are required to use the DrunkDiary map. Please enable them and reopen the map.',
                        );
                        break;
                    // @ts-ignore
                    case 'E_LOCATION_SERVICES_DISABLED':
                        Alert.alert(
                            'Location disabled',
                            'Your location services are disabled but they are required to use the DrunkDiary map. Please enable them and reopen the map.',
                        );
                        break;
                    default:
                        Alert.alert(
                            'Unexpected error',
                            'An unexpected error occurred while determining your current location. Please check that location services are activated and permitted to DrunkDiary and try to open the map again.',
                        );
                }
                navigateTo(this, 'Main Page');
            },
        );
    }

    togglePopupVisible(): void {
        this.setState({popupVisible: !this.state.popupVisible});
    }

    toggleSettingsVisible(): void {
        this.setState({settingsVisible: !this.state.settingsVisible});
    }

    toggleBuddiesOnly(): void {
        this.setState({buddiesOnly: !this.state.buddiesOnly});
    }

    selectPin(id): void {
        this.setState({currentPin: id, tracking: false});
        this.togglePopupVisible();
    }

    closeSettings(): void {
        this.loadMarkers();
        this.toggleSettingsVisible();
    }

    /**
     * Sets the user location.
     * @param location the location of the user
     * @param zoomLevel the zoom level specifies how much the map should zoom into the user's location.
     */
    setUserLocation(location: UserLocation, zoomLevel: ZoomLevel): void {
        if (
            this.state.currentPosition.latitude !== location.latitude ||
            this.state.currentPosition.longitude !== location.longitude
        ) {
            this.setState({
                currentPosition: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: zoomLevel.latitudeDelta,
                    longitudeDelta: zoomLevel.longitudeDelta,
                },
            });
            if (this.state.tracking) {
                this.changeToUserLocation();
            }
        }
    }

    /**
     * Changes the map view to user's location.
     */
    changeToUserLocation(): void {
        this.mapView.animateToRegion(
            this.state.currentPosition,
            ANIMATION_DURATION_MS,
        );
    }

    toggleTracking(): void {
        if (!this.state.tracking) {
            this.changeToUserLocation();
        }
        setTimeout(
            () => this.setState({tracking: !this.state.tracking}),
            this.state.tracking ? 0 : ANIMATION_DURATION_MS,
        );
    }

    /**
     * Loads the markers onto the map.
     * If an error occurs, the user will be notified.
     */
    loadMarkers(): void {
        axios
            .get(
                apiGetPinsNear +
                    this.state.currentPosition.latitude +
                    '&' +
                    this.state.currentPosition.longitude +
                    '&' +
                    this.state.radiusInMeter +
                    '&' +
                    this.props.route.params.name,
            )
            .then(
                function (response) {
                    this.setState({markers: response.data});
                }.bind(this),
            )
            .catch(function (error: Error) {
                alert(
                    "Ops something isn't working. Please reopen the map and remember to turn on your GPS.",
                );
                console.log('Error loading pins ' + error);
            });
    }

    render(): ReactNode {
        return (
            <PaperProvider>
                <View style={{flex: 1}}>
                    <MapView
                        style={styles.map}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        showsCompass={false}
                        onUserLocationChange={(
                            changedLocation: EventUserLocation,
                        ) =>
                            this.setUserLocation(
                                changedLocation.nativeEvent.coordinate,
                                MAP_ZOOM_LEVEL,
                            )
                        }
                        onPanDrag={
                            this.state.tracking
                                ? () => this.toggleTracking()
                                : null
                        }
                        onMapReady={() => this.onMapReady()}
                        ref={(ref) => (this.mapView = ref)}>
                        {this.state.markers.map((elem, key) => {
                            if (
                                !this.state.buddiesOnly ||
                                buddyArrayContainsName(
                                    this.props.route.params.buddies,
                                    elem.host,
                                )
                            ) {
                                return (
                                    <Marker
                                        coordinate={{
                                            latitude: elem.latitude,
                                            longitude: elem.longitude,
                                        }}
                                        identifier={elem.pinId}
                                        key={key}
                                        image={
                                            buddyArrayContainsName(
                                                this.props.route.params.buddies,
                                                elem.host,
                                            )
                                                ? require(IMAGE_PATH_BUDDY_PIN)
                                                : require(IMAGE_PATH_PIN)
                                        }
                                        onPress={() =>
                                            this.selectPin(elem.pinId)
                                        }
                                    />
                                );
                            }
                        })}
                    </MapView>
                    <View style={styles.fabContainer}>
                        <FAB
                            style={[styles.fab]}
                            color={COLOR_BUTTON_UNPRESSED}
                            icon={'settings'}
                            onPress={() => this.toggleSettingsVisible()}
                        />
                        <FAB
                            style={[styles.fab]}
                            color={
                                this.state.buddiesOnly
                                    ? COLOR_BUTTON_PRESSED
                                    : COLOR_BUTTON_UNPRESSED
                            }
                            icon={'human-male-female'}
                            onPress={() => this.toggleBuddiesOnly()}
                        />
                        <FAB
                            style={styles.fab}
                            icon={'plus'}
                            onPress={() => this.togglePopupVisible()}
                        />
                        <FAB
                            style={[styles.fab]}
                            color={
                                this.state.tracking
                                    ? COLOR_BUTTON_PRESSED
                                    : COLOR_BUTTON_UNPRESSED
                            }
                            icon={'crosshairs-gps'}
                            onPress={() => this.toggleTracking()}
                        />
                    </View>
                    <Portal>
                        <Dialog
                            visible={this.state.popupVisible}
                            onDismiss={() => this.selectPin('')}>
                            <Dialog.Content style={styles.popup}>
                                <Pin
                                    id={this.state.currentPin}
                                    location={this.state.currentPosition}
                                    userName={this.state.userName}
                                    email={this.state.email}
                                    loadMarkers={this.loadMarkers}
                                />
                            </Dialog.Content>
                        </Dialog>
                        <Dialog
                            visible={this.state.settingsVisible}
                            onDismiss={() => this.closeSettings()}>
                            <Dialog.Content style={styles.popup}>
                                <Title>Settings</Title>
                                <Subheading>Radius: </Subheading>
                                <Caption>
                                    Pins are loaded{' '}
                                    {this.state.radiusInMeter / 1000} km around
                                    your position.
                                </Caption>
                                <Slider
                                    style={{width: '100%'}}
                                    minimumValue={1}
                                    maximumValue={20}
                                    step={1}
                                    value={this.state.radiusInMeter / 1000}
                                    onValueChange={(radius: number) =>
                                        this.setState({
                                            radiusInMeter: 1000 * radius,
                                        })
                                    }
                                />
                                <View
                                    style={[
                                        globalStyles.formElemSpacing,
                                        {
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        },
                                    ]}>
                                    <Subheading>Friends only</Subheading>
                                    <Switch
                                        value={this.state.buddiesOnly}
                                        onValueChange={() =>
                                            this.toggleBuddiesOnly()
                                        }
                                    />
                                </View>
                                <Caption>
                                    {this.state.buddiesOnly
                                        ? 'Only pins of your friends'
                                        : 'All pins around you'}{' '}
                                    are shown.
                                </Caption>
                            </Dialog.Content>
                        </Dialog>
                    </Portal>
                </View>
            </PaperProvider>
        );
    }
}
