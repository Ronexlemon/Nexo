import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { useSession } from '../../../context/Sessioncontext';
import HomeScreen from '../HomeScreen';
import DetailsScreen from '../DetailScreen';
import PinScreen from '../PinScreen';
import SettingsScreen from '../SettingScreen';
import AddressScreen from '../AddressScren';
import RecoveryPhraseScreen from '../PhraseScreen';
import UnlockScreen from '../UnlockScreen';
import AuthScreen from '../AuthScreen';



const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { resetInactivityTimer } = useSession(); 

  const handleUserInteraction = () => {
    resetInactivityTimer();
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleUserInteraction}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          // initialRouteName="Home"
          initialRouteName="AuthScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="pin" component={PinScreen} />
          <Stack.Screen name="setting" component={SettingsScreen} />
          <Stack.Screen name="UnlockScreen" component={UnlockScreen} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen
            name="AddressScreen"
            component={AddressScreen}
            options={{
              headerShown: true,
              title: 'Wallet Address',
              headerBackVisible: true,
            }}
          />
          <Stack.Screen
            name="RecoveryPhraseScreen"
            component={RecoveryPhraseScreen}
            options={{
              title: 'Recovery Phrase',
              headerShown: true,
              headerBackVisible: true,
            }}
          />
        </Stack.Navigator>
      </View>
    </TouchableWithoutFeedback>
  );
};


export default StackNavigator;
