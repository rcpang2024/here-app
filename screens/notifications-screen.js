import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, FlatList, 
    RefreshControl, Image } from "react-native";
import { useEffect, useContext, useState, useMemo, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { supabase } from "../lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(UserContext);
    const auth = FIREBASE_AUTH;
    const [fetched, setFetched] = useState(false);
    const [refresh, setRefresh] = useState(false);
    // const fetchedRef = useRef(false);

    const [notifications, setNotifications] = useState({
        follow_notifications: [],
        event_registrations: []
    });

    const storeNotifications = async (notificationsData) => {
        try {
            await AsyncStorage.setItem('notifications', JSON.stringify(notificationsData));
        } catch (error) {
            console.error("Error saving notifications: ", error);
        }
    };

    // Retrieve data from AsyncStorage
    const retrieveNotifications = async () => {
        try {
            const storedNotifications = await AsyncStorage.getItem('notifications');
            if (storedNotifications) {
                setNotifications(JSON.parse(storedNotifications));
                setFetched(true); // Set fetched to true to avoid re-fetching
            } else {
                retrieveFollowerNotification(); // Fetch from the API if no saved data
                retrieveEventNotification();
            }
        } catch (error) {
            console.error("Error retrieving notifications: ", error);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="black"
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 16 }}
                />
            )
        });
        if (!fetched) {
            retrieveNotifications();
            // console.log("fetched: ", fetched);
            // retrieveFollowerNotification();
            // retrieveEventNotification();
            // setFetched(true);
            // console.log("fetched 2: ", fetched);
        }
    }, [fetched]);

    const retrieveFollowerNotification = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        // console.log("idToken in retrieveFollower: ", idToken);
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/follower_notifications/${user.id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("follower data: ", data);
                setNotifications(prevNotifications => {
                    const updatedNotifications = {
                        ...prevNotifications,
                        follow_notifications: data
                    };
                    storeNotifications(updatedNotifications);  // Call storeNotifications inside this callback to ensure correct timing
                    return updatedNotifications;
                });
            } else {
                console.error("Problem retrieving follower notifications");
            }
        } catch (e) {
            console.error("Error retrieving your follower notifications: ", e);
        }
    };

    const retrieveEventNotification = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/event_notifications/${user.id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(prevNotifications => {
                    const updatedNotifications = {
                        ...prevNotifications,
                        event_registrations: sorted
                    };
                    storeNotifications(updatedNotifications);  // Ensure to store the updated state here too
                    return updatedNotifications;
                });
            } else {
                console.error("Problem retrieving event notifications");
            }
        } catch (e) {
            console.error("Error retrieving your event notifications: ", e);
        }
    };

    const fetchUserProfile = async (username) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/username/${username}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const userData = await response.json();
            return userData;
        } catch (err) {
            console.log("Error fetching user profile: ", err);
        }
    };

    const handleUserPress = async (username) => {
        const profileUser = await fetchUserProfile(username);
        if (profileUser && profileUser.username !== user.username) {
            navigation.navigate('Other Profile', { profileUser });
        } else if (username === user.username) {
            navigation.navigate('Profile');
        } else {
            console.error('Failed to fetch profile user');
        }
    };

    const fetchEvent = async (eventID) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/events/${eventID}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const data = await response.json()
            return data;
        } catch (e) {
            console.error("Error fetching event: ", e);
        }
    };

    const handleEventPress = async (eventID) => {
        const theEvent = await fetchEvent(eventID);
        if (theEvent) {
            navigation.navigate('Event Details', {
                eventID: theEvent.id,
                creationUser: theEvent.creation_user_username,
                eventName: theEvent.event_name,
                eventDescription: theEvent.event_description,
                theLocation: theEvent.location_addr,
                theDate: theEvent.date,
                attendees: theEvent.list_of_attendees
            });
        } else {
            console.error("Failed to retrieve the event in handleEventPress");
        }
    };

    const onRefresh = useCallback(() => {
        setFetched(false);
        setRefresh(true);
        retrieveFollowerNotification(); // Fetch from the API if no saved data
        retrieveEventNotification();
        setRefresh(false);
    }, []);

    const memoizedFollowerNotification = useMemo(() => notifications.follow_notifications, [notifications.follow_notifications]);
    const memoizedEventNotifications = useMemo(() => notifications.event_registrations, [notifications.event_registrations]);
    
    const renderFollowerNotifications = useMemo(() => ({ item }) => (
        <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => handleUserPress(item.sender_username)}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image 
                            source={item.sender_photo ? {uri: item.sender_photo} : FallbackPhoto} 
                            style={styles.image}
                        />
                        <Text style={styles.userText}>{item.sender_username}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.text}> began following you.</Text>
            </View>
            <View style={{borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth}}/>
        </View>
    ), []);

    const renderEventNotifications = useMemo(() => ({ item }) => (
        <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => handleUserPress(item.sender_username)}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image 
                            source={item.sender_photo ? {uri: item.sender_photo} : FallbackPhoto} 
                            style={styles.image}
                        />  
                        <Text style={styles.userText}>{item.sender_username}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.text}> is going to your event:</Text>
            </View>
            {item.event && item.event_name ? (
                <TouchableOpacity onPress={() => handleEventPress(item.event)}>
                    <Text style={styles.event_name_text}>{item.event_name}</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.event_name_text}>Event name not found</Text>
            )}
            <View style={{borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth}}/>
        </View>
    ), []);

    return (
        <View>
            <TouchableHighlight underlayColor={'gray'} onPress={() => navigation.navigate("Follow Request")}>
                <Text style={styles.headers}>Follow Requests</Text>
            </TouchableHighlight>
            <View style={{borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth}}/>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={styles.headers}>Events</Text>
                <Ionicons 
                    name="refresh"
                    size={24}
                    color="black"
                    onPress={onRefresh}
                    style={{ marginRight: 16 }}
                />
            </View>
            <FlatList
                data={memoizedFollowerNotification}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderFollowerNotifications}
            />
            <FlatList
                data={memoizedEventNotifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventNotifications}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    headers: {
        fontSize: 24, fontWeight: 'bold', paddingLeft: 10, paddingTop: 8, paddingBottom: 15
    },
    userText: {
        paddingLeft: 10, paddingBottom: 5, paddingTop: 5, fontSize: 20, color: '#BD7979'
    },
    text: {
        paddingBottom: 3, paddingTop: 5, fontSize: 20
    }, 
    event_name_text: {
        paddingLeft: 10, paddingTop: 2, paddingBottom: 5, fontSize: 20, color: '#2da7a6'
    },
    image: {
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 8,
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
})

export default NotificationsScreen