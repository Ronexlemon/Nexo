import 'react-native-get-random-values';
import 'text-encoding'; 


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, useColorScheme } from 'react-native';
import StackNavigator from './src/screens/navigation/StackNavigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import store, { persistor } from './store/redux';
import { SessionProvider } from './context/Sessioncontext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message'

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <BottomSheetModalProvider>
      <NavigationContainer>
        <SessionProvider>
          <Provider store={store}>
            <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
              <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
              <StackNavigator />
            </PersistGate>
          </Provider>
        </SessionProvider>
      </NavigationContainer>
      </BottomSheetModalProvider>
      <Toast />
  </GestureHandlerRootView>
   
    
   
  );
}

export default App;
