import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../user-context";

const AttendeesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    const list_of_attendees = route.params.attendees;
    const [attendeesWithUsernames, setAttendeesWithUsernames] = useState([]);

    const fetchUsernamesForAttendees = async () => {
        try {
            const attendeesWithUsernames = await Promise.all(
                list_of_attendees.map(async (attendeeID) => {
                const response = await fetch(`http://192.168.1.6:8000/api/users/id/${attendeeID}/`);
                if (!response.ok) {
                    throw new Error('Network response for user data was not ok');
                }
                const userData = await response.json();
                return userData.username;
            })
        );
        setAttendeesWithUsernames(attendeesWithUsernames);
        } catch (error) {
            console.error('Error fetching usernames for attendees:', error);
        }
    };

    useEffect(() => {
        // Set the left header component
        navigation.setOptions({
            headerLeft: () => (
            <Ionicons
                name="arrow-back"
                size={28}
                color="black"
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 16 }}
            />
            ),
        });
        fetchUsernamesForAttendees();
    }, []);

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

    return (
        <View style={styles.title}>
            <FlatList
                data={attendeesWithUsernames}
                keyExtractor={(item) => item}
                renderItem={({ item }) => <TouchableOpacity onPress={() => handleUserPress(item)}>
                    <Text style={styles.text}>{item}</Text></TouchableOpacity>}
                refreshControl = {
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => console.log('Refreshing attendees list')}
                    />
                }
                contentContainerStyle={{paddingBottom: 100}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10, paddingLeft: 10, fontSize: 32
    },
    text: {
        paddingTop: 25,
        paddingLeft: 10,
        fontSize: 20,
        color: 'darkblue',
        borderStyle: 'solid',
        borderRadius: 2,
        borderColor: 'black',
    }
})

export default AttendeesScreen;