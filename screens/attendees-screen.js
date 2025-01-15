import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const AttendeesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);
    const auth = FIREBASE_AUTH;

    const list_of_attendees = route.params.attendees;
    const event_id = route.params.idEvent;
    const [attendeesWithUsernames, setAttendeesWithUsernames] = useState([]);

    const fetchAttendees = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/event_attendees/${event_id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response for user data was not ok');
            }
            const userData = await response.json();
            const attendees = userData.map(userData => ({
                username: userData.username,
                name: userData.name,
                profile_pic: userData.profile_pic
            }));
            console.log("attendees: ", attendees);
            setAttendeesWithUsernames(attendees);
        } catch (e) {
            console.error('Error fetching usernames for attendees:', e);
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
        fetchAttendees();
    }, []);

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
                keyExtractor={(item) => item.username}
                renderItem={({ item }) => 
                    <TouchableOpacity onPress={() => handleUserPress(item.username)}>
                    <View style={{flexDirection: 'row'}}>
                        <Image source={item.profile_pic ? {uri: item.profile_pic} : FallbackPhoto} style={styles.image}/>
                        <View>
                            <Text style={styles.text}>{item.username}</Text>
                            <Text style={styles.name}>{item.name}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                }
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
        paddingTop: 10, paddingLeft: 2, fontSize: 32
    },
    text: {
        fontWeight: 'bold', paddingBottom: 5, marginLeft: 8, marginTop: 15, fontSize: 20
    },
    name: {
        fontSize: 14, marginLeft: 8
    },
    image: {
        marginLeft: 8,
        marginTop: 5,
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
})

export default AttendeesScreen;