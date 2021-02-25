import {requestErrorHandling} from './helper';
import {getCurrentUser, saveUser} from './userManagement';

const axios: any = require('axios');
const url: string =
    require('../../../config.json').server +
    require('../../../config.json').apiUser;
const removeUrl: string = url + '/removeBuddy';
const addUrl: string = url + '/addBuddy';

/**
 * removes the buddy from current user friends in local storage only
 * @param buddy to remove
 */
export function removeBuddyFromCurrentUser(buddy: {
    name: string;
    color: string;
}): void {
    getCurrentUser()
        .then((userString) => {
            let user = JSON.parse(userString);
            const index = user.friends.indexOf(buddy);
            if (index > -1) {
                user.friends.splice(index, 1);
                saveUser(user);
            }
        })
        .catch(function (e) {
            console.error(
                'Error getting current user from AsyncStorage: ' + e.message,
            );
        });
}

/**
 * adds the buddy to current user friends in local storage only
 * @param buddy to add
 */
export function addBuddyToCurrentUser(buddy: Buddy): void {
    getCurrentUser()
        .then((userString) => {
            let user = JSON.parse(userString);
            user.friends.push(buddy);
            saveUser(user);
        })
        .catch(function (e) {
            console.error(
                'Error getting current user from AsyncStorage: ' + e.message,
            );
        });
}

function sendBuddyToUrl(
    targetUrl: string,
    buddyName: string,
    userEmail: string,
    onDone: Function,
    onError: Function,
): void {
    axios({
        method: 'post',
        url: targetUrl,
        data: {
            buddy: buddyName,
            user: userEmail,
        },
    })
        .then(() => {
            if (onDone) {
                onDone.bind(this)();
            }
        })
        .catch((error) => {
            requestErrorHandling(error);
            if (onError) {
                onError.bind(this)();
            }
        });
}

/**
 * addes buddy on server to friendlist of specified user
 * @param userEmail: user to which buddy should be added
 * @param buddyName: buddy which should be added
 * @param onDone: function to do when done
 * @param onError: function to do when an error occurs
 */
export async function addBuddy(
    userEmail: string,
    buddyName: string,
    onDone: Function,
    onError: Function,
) {
    sendBuddyToUrl.bind(this)(addUrl, buddyName, userEmail, onDone, onError);
}

/**
 * removes buddy on server from friendlist of specified user
 * @param userEmail: user from which buddy should be removed
 * @param buddyName: buddy which should be removed
 * @param onDone: function to do when done
 * @param onError: function to do when an error occurs
 */
export async function removeBuddy(
    userEmail: string,
    buddyName: string,
    onDone: Function,
    onError: Function,
) {
    sendBuddyToUrl.bind(this)(removeUrl, buddyName, userEmail, onDone, onError);
}

export function buddyArrayContainsName(
    buddies: Buddy[],
    name: string,
): boolean {
    return undefined !== buddies.find((buddy) => buddy.name === name);
}
