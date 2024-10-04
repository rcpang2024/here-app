import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, FlatList } from "react-native";
import { useEffect, useContext, useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(UserContext);
    const auth = FIREBASE_AUTH;
    const [idToken, setIdToken] = useState(null);

    const [notifications, setNotifications] = useState({
        follow_notifications: [],
        event_registrations: []
    });

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
        const fetchToken = async () => {
            const token = await auth.currentUser.getIdToken();
            setIdToken(token);
            console.log("idToken set in notifications screen");
        };
        fetchToken();
        if (user) {
            retrieveFollowerNotification();
            retrieveEventNotification();
        }
    }, [user]);

    const retrieveFollowerNotification = async () => {
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
                // const follower_arr = [data]
                // const sorted = follower_arr.sort((a ,b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(prevNotifications => ({
                    ...prevNotifications,
                    follow_notifications: data
                }));
            } else {
                console.error("Problem retrieving follower notifications");
            }
        } catch (e) {
            console.error("Error retrieving your follower notifications: ", e);
        }
    };

    const retrieveEventNotification = async () => {
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
                const events_arr = [...data];
                const sorted = events_arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(prevNotifications => ({
                    ...prevNotifications,
                    event_registrations: sorted
                }));
                console.log("notifications: ", notifications.event_registrations)
            } else {
                console.error("Problem retrieving event notifications");
            }
        } catch (e) {
            console.error("Error retrieving your event notifications: ", e);
        }
    };

    const fetchUserProfile = async (username) => {
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

    const memoizedFollowerNotification = useMemo(() => notifications.follow_notifications, [notifications.follow_notifications]);
    const memoizedEventNotifications = useMemo(() => notifications.event_registrations, [notifications.event_registrations]);

    const renderFollowerNotifications = useMemo(() => ({ item }) => (
        <View>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => handleUserPress(item.sender_username)}>
                    <Text style={styles.userText}>{item.sender_username}</Text>
                </TouchableOpacity>
                <Text style={styles.text}> began following you.</Text>
            </View>
            <View style={{borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth}}/>
        </View>
    ), []);

    const renderEventNotifications = useMemo(() => ({ item }) => (
        <View>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => handleUserPress(item.sender_username)}>
                    <Text style={styles.userText}>{item.sender_username}</Text>
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
            <Text style={styles.headers}>Events</Text>
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
        fontSize: 21, fontWeight: 'bold', paddingLeft: 10, paddingTop: 8, paddingBottom: 15
    },
    userText: {
        paddingLeft: 10, paddingBottom: 5, paddingTop: 5, fontSize: 20, color: '#BD7979'
    },
    text: {
        paddingBottom: 3, paddingTop: 5, fontSize: 20
    }, 
    event_name_text: {
        paddingLeft: 10, paddingTop: 2, paddingBottom: 5, fontSize: 20, color: '#2da7a6'
    }
})

export default NotificationsScreen