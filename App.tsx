import 'react-native-get-random-values';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, StatusBar, useColorScheme } from 'react-native';
import StackNavigator from './src/screens/navigation/StackNavigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import store, { persistor } from './store/redux';
import { SessionProvider } from './context/Sessioncontext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
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
   
    
   
  );
}

export default App;
