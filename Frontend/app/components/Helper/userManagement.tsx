import {AsyncStorage} from 'react-native';
import {navigateTo} from './helper';

const USER_KEY = 'currentUser';

/**
 * Stores the current user in AsyncStorage
 * @param response An http response
 */
export function setCurrentUser(response: any) {
    const user = response.data;
    user.token = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
    saveUser(user);
}

/**
 * Gets the current user from AsyncStorage
 */
export function getCurrentUser(): any {
    return AsyncStorage.getItem(USER_KEY)
        .then((user: string) => {
            return user;
        })
        .catch(function (e) {
            console.error('ERROR getting user from AsyncStorage ' + e.message);
        });
}

/**
 * updates the color of the current user in AsyncStorage
 * @param newColor: new color
 */
export function updateCurrentUserColor(newColor: string): void {
    getCurrentUser()
        .then((userString: any) => {
            let user = JSON.parse(userString);
            user.color = newColor;
            saveUser(user);
        })
        .catch(function (error) {
            console.error(
                'Error setting color for current user in AsyncStorage: ' +
                    error.message,
            );
        });
}

/**
 * saves user to asyncstorage
 * @param user
 */
export function saveUser(user: any) {
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
        .then(() => console.log('locally saved user'))
        .catch((error) => {
            console.log('ERROR saving user ' + error.message);
        });
}

export function goToMainPageIfLoggedIn(that: any): boolean {
    getCurrentUser()
        .then((userString: any) => {
            let user = JSON.parse(userString);
            if (user) {
                navigateTo(that, 'Main Page');
                return true;
            }
        })
        .catch(function (e) {
            console.error(
                'Error getting current user from AsyncStorage: ' + e.message,
            );
        });
    return false;
}
