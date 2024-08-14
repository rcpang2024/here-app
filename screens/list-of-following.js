import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";

const FollowingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    const list_of_following = route.params.following;
    const [following, setFollowing] = useState([]);

    const fetchFollowing = async () => {
        try {
            const followingWithUsernames = await Promise.all(
                list_of_following.map(async (followingID) => {
                const response = await fetch(`http://192.168.1.6:8000/api/users/id/${followingID}/`);
                if (!response.ok) {
                    throw new Error('Network response for user data was not ok');
                }
                const userData = await response.json();
                return userData.username;
            })
        );
        setFollowing(followingWithUsernames);
        } catch (error) {
            console.error('Error fetching following:', error);
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
        fetchFollowing();
    }, []);

    return (
        <View>
            <FlatList
                data={following}
                keyExtractor={(item) => item}
                renderItem={({ item }) => <TouchableOpacity onPress={() => handleUserPress(item)}>
                    <Text style={styles.text}>{item}</Text></TouchableOpacity>}
                contentContainerStyle={{paddingBottom: 100}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    text: {
        fontWeight: 'bold',
        paddingBottom: 5,
        marginLeft: 8,
        marginTop: 5,
        fontSize: 24,
    },
})

export default FollowingScreen;