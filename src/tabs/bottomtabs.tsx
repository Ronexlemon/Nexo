
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import SettingsScreen from '../screens/SettingScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DetailsScreen from '../screens/DetailScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3182ce',
          tabBarInactiveTintColor: '#aaa',
        }}
      >
        <Tab.Screen name="Details" component={DetailsScreen} />
       
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
      </Tab.Navigator>
    );
  };
  
export default MainTabs;