import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home-screen';
import ProfileScreen from '../screens/profile-screen';
import OtherProfileScreen from '../screens/other-profiles-screen';
import CreateEventScreen from '../screens/create-event-screen';
import ExploreScreen from '../screens/friends-screen';
import SearchScreen from '../screens/search-screen';
import EventDetailScreen from '../screens/event-detail-screen';
import AttendeesScreen from '../screens/attendees-screen';
import SettingsScreen from '../screens/settings-screen';
import LogInScreen from '../screens/login-screen';
import CreateUserScreen from '../screens/create-user-screen';
import EditProfileScreen from '../screens/edit-profile-screen';
import EditEventScreen from '../screens/edit-event-screen';
import AboutHereScreen from '../screens/about-here-screen';
import ConfirmEmailScreen from '../screens/confirm-email-screen';
import ForgotScreen from '../screens/forgot-pw-screen';
import FollowersScreen from '../screens/list-of-followers';
import FollowingScreen from '../screens/list-of-following';
import { createStackNavigator } from '@react-navigation/stack';

const homeName = 'Home';
const profileName = 'Profile';
const createEventName = 'Create Event';
const exploreName = 'Explore';
const searchName = 'Search';
const loginName = 'Login';
const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();

export function MainContainer() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" options={{ headerShown: false }} component={LogInScreen} />
        <Stack.Screen name="Create Account" component={CreateUserScreen} />
        <Stack.Screen name="Confirm Email" options={{ headerShown: false }} component={ConfirmEmailScreen} />
        <Stack.Screen name="Forgot" options={{ headerShown: false }} component={ForgotScreen} />
        <Stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Event Details" component={EventDetailScreen} />
        <Stack.Screen name="Attendees" component={AttendeesScreen}/>
        <Stack.Screen name="Settings" component={SettingsScreen}/>
        <Stack.Screen name="Followers" component={FollowersScreen}/>
        <Stack.Screen name="Following" component={FollowingScreen}/>
        <Stack.Screen name="Edit Profile" component={EditProfileScreen}/>
        <Stack.Screen name="Edit Event" component={EditEventScreen}/>
        <Stack.Screen name="About Here" options={{ headerShown: false }} component={AboutHereScreen}/>
        <Stack.Screen name="Other Profile" options={{headerTitle: ''}} component={OtherProfileScreen}/>
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
          } else if (rn === exploreName) {
            iconName = focused ? 'map' : 'map-outline';
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
      <Tab.Screen name={exploreName} component={ExploreScreen} />
      <Tab.Screen name={createEventName} component={CreateEventScreen} />
      <Tab.Screen name={searchName} component={SearchScreen} />
      <Tab.Screen name={profileName} component={ProfileScreen} />
    </Tab.Navigator>
  );
}
