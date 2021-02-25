import 'react-native-gesture-handler'; //has to be on top!!!
import React from 'react';
import MainPage from './app/components/MainPage/mainPage';

import Login from './app/components/Login/login';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Profile from './app/components/Profile/profile';
import LobbyContainer from './app/components/Lobby/lobbyContainer';
import Map from './app/components/Map/map';
import Register from './app/components/Register/register';

const Stack = createStackNavigator();

export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={Login}/>
                <Stack.Screen name="LobbyContainer" component={LobbyContainer}/>
                <Stack.Screen name="Main Page" component={MainPage}/>
                <Stack.Screen name="Drunk Map" component={Map}/>
                <Stack.Screen name="Profile" component={Profile}/>
                <Stack.Screen name="Register" component={Register}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}