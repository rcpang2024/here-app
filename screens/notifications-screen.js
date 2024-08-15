import { View, Text, StyleSheet, TouchableHighlight, TouchableOpacity, FlatList } from "react-native";
import { useEffect, useContext, useState, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(UserContext);
    const [notifications, setNotifications] = useState({
        follow_notifications: [],
        event_registrations: []
    });
    const [senderUsernames, setSenderUsernames] = useState([]);

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
        if (user) {
            retrieveFollowerNotification();
            retrieveEventNotification();
        }
    }, [user]);

    const retrieveFollowerNotification = async () => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/follower_notifications/${user.id}/`);
            if (response.ok) {
                const data = await response.json();
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
            const response = await fetch(`http://192.168.1.6:8000/api/event_notifications/${user.id}/`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(prevNotifications => ({
                    ...prevNotifications,
                    event_registrations: data
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
            const response = await fetch(`http://192.168.1.6:8000/api/users/username/${username}/`);
            const userData = response.json();
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
        </View>
    ), []);

    const renderEventNotifications = useMemo(() => ({ item }) => (
        <View>
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => handleUserPress(item.sender_username)}>
                    <Text style={styles.userText}>{item.sender_username}</Text>
                </TouchableOpacity>
                <Text style={styles.text}> is going to your event.</Text>
            </View>
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
        fontSize: 21,
        fontWeight: 'bold',
        paddingLeft: 10,
        paddingTop: 8,
        paddingBottom: 15
    },
    userText: {
        paddingLeft: 10,
        paddingBottom: 20,
        fontSize: 20,
        color: '#BD7979'
    },
    text: {
        paddingTop: 3,
        paddingBottom: 20,
        fontSize: 16
    }
})

export default NotificationsScreen