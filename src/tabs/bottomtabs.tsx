import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import SettingsScreen from '../screens/SettingScreen';
import DetailsScreen from '../screens/DetailScreen';
import HistoryScreen from '../screens/activity/HistoryScreen';
import ExploreScreen from '../screens/discover/ExploreScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3182ce',
        tabBarInactiveTintColor: '#aaa',
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Wallet':
              iconName = 'credit-card'; 
              break;
            case 'Activity':
              iconName = 'history';
              break;
            case 'Discover':
              iconName = 'compass';
              break;
            default:
              iconName = 'circle';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Wallet" component={DetailsScreen} />
      <Tab.Screen name="Activity" component={HistoryScreen} />
      <Tab.Screen name="Discover" component={ExploreScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
