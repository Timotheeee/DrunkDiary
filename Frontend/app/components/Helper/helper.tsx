import {AsyncStorage} from 'react-native';

export declare var global: any;

/**
 * This method is to unify all navigation calls.
 * Maybe this can be used in future to make some checks before routing
 *
 * @param pageName check the App.tsx for the possible names
 * @param that needed to call navigation
 */
export function navigateTo(that, pageName: string, parameter?: object) {
    that.props.navigation.navigate(pageName, parameter);
}

export function requestErrorHandling(error: any): void {
    if (error.response) {
        console.log('Error from response');
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        console.log('Error from request');
        console.log(error.request);
    } else {
        console.log('Error during setup');
        console.log('Error', error.message);
    }
}

/**
 * Displays message in Snackbar, dont forget to bind this.
 * @param message
 */
export function displayMessage(message: string): Function {
    return function () {
        this.setState({snackBar: {visible: true, msg: message}});
    };
}

export function clearAsyncStorage(): void {
    AsyncStorage.clear()
        .then(() => {
            //alert('Storage successfully cleared!')
        })
        .catch(function () {
            alert('Failed to clear the async storage.');
        });
}

