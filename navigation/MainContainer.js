import { NavigationContainer } from '@react-navigation/native';
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
import ForgotScreen from '../screens/forgot-pw-screen';
import FollowersScreen from '../screens/list-of-followers';
import FollowingScreen from '../screens/list-of-following';
import NotificationsScreen from '../screens/notifications-screen';
import FollowRequestScreen from '../screens/follow-request-screen';
import ContactUsScreen from '../screens/contact-us-screen';
import { createStackNavigator } from '@react-navigation/stack';
import BlockedUsersScreen from '../screens/blocked-users-screen';
import SecurityScreen from '../screens/security-screen';
import PrivateMessageScreen from '../screens/private-message-screen';
import ChatScreen from '../screens/chat-screen';

const Tab = createBottomTabNavigator();

const Stack = createStackNavigator();

export function MainContainer() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" options={{ headerShown: false }} component={LogInScreen} />
        <Stack.Screen name="Create Account" component={CreateUserScreen} />
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
        <Stack.Screen name="Notifications" component={NotificationsScreen}/>
        <Stack.Screen name="Follow Request" options={{headerTitle: ''}} component={FollowRequestScreen}/>
        <Stack.Screen name="Blocked Users" component={BlockedUsersScreen}/>
        <Stack.Screen name="Contact Us" component={ContactUsScreen}/>
        <Stack.Screen name="Security" component={SecurityScreen}/>
        <Stack.Screen name="Message" component={PrivateMessageScreen}/>
        <Stack.Screen name="Chat Screen" options={{headerTitle: ''}} component={ChatScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName='Login'
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;
          if (rn === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (rn === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (rn === 'Create Event') {
            iconName = focused ? 'add' : 'add-outline';
          } else if (rn === 'Explore') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (rn === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#BD7979',
        tabBarInactiveTintColor: 'grey',
        tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
        tabBarStyle: { padding: 10, height: 100 }
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='Explore' component={ExploreScreen} />
      <Tab.Screen name='Create Event' component={CreateEventScreen} />
      <Tab.Screen name='Search' component={SearchScreen} options={{headerShown: false}}/>
      <Tab.Screen name='Profile' component={ProfileScreen} options={{headerTitle: ''}}/>
    </Tab.Navigator>
  );
}
