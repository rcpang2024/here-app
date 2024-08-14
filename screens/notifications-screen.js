import { View, Text, StyleSheet, TouchableHighlight, FlatList } from "react-native";
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
                console.error("Problem retrieving follower notifications")
            }
        } catch (e) {
            console.error("Error retrieving your follower notifications: ", e);
        }
    };

    const memoizedFollowerNotification = useMemo(() => notifications.follow_notifications, [notifications.follow_notifications]);
    const memoizedEventNotifications = useMemo(() => notifications.event_registrations, [notifications.event_registrations]);

    const renderFollowerNotifications = useMemo(() => ({ item }) => (
        <View>
            <Text style={styles.text}>{item.sender} began following you.</Text>
        </View>
    ), []);

    const renderEventNotifications = useMemo(() => ({ item }) => (
        <View>
            <Text style={styles.text}>{item.sender} is going to your event.</Text>
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
    text: {
        paddingLeft: 10,
        paddingTop: 3,
        paddingBottom: 10,
        fontSize: 16
    }
})

export default NotificationsScreen