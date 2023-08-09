import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home-screen';
import ProfileScreen from '../screens/profile-screen';
import CreateEventScreen from '../screens/create-event-screen';
import FriendsScreen from '../screens/friends-screen';
import SearchScreen from '../screens/search-screen';
import EventDetailScreen from '../screens/event-detail-screen';
import AttendeesScreen from '../screens/attendees-screen';
import SettingsScreen from '../screens/settings-screen';
import LogInScreen from '../screens/login-screen';
import CreateUserScreen from '../screens/create-user-screen';
import { createStackNavigator } from '@react-navigation/stack';

const homeName = 'Home';
const profileName = 'Profile';
const createEventName = 'Create Event';
const friendsName = 'Friends';
const searchName = 'Search';
const loginName = 'Login';
const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#1c2120'
  }
};

export function MainContainer() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" options={{ headerShown: false }} component={LogInScreen} />
        <Stack.Screen name="Create Account" component={CreateUserScreen} />
        <Stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Event Details" component={EventDetailScreen} />
        <Stack.Screen name="Attendees" component={AttendeesScreen}/>
        <Stack.Screen name="Settings" component={SettingsScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={loginName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;
          if (rn === homeName) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (rn === profileName) {
            iconName = focused ? 'person' : 'person-outline';
          } else if (rn === createEventName) {
            iconName = focused ? 'add' : 'add-outline';
          } else if (rn === friendsName) {
            iconName = focused ? 'people' : 'people-outline';
          } else if (rn === searchName) {
            iconName = focused ? 'search' : 'search-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'darkred',
        tabBarInactiveTintColor: 'grey',
        tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
        tabBarStyle: { padding: 10, height: 100 }
      })}
    >
      <Tab.Screen name={homeName} component={HomeScreen} />
      <Tab.Screen name={friendsName} component={FriendsScreen} />
      <Tab.Screen name={createEventName} component={CreateEventScreen} />
      <Tab.Screen name={searchName} component={SearchScreen} />
      <Tab.Screen name={profileName} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
