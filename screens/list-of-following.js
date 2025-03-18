import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";
import { getToken } from "../secureStorage";

const FollowingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    const currUsername = route.params.username;
    const [following, setFollowing] = useState([]);

    const fetchFollowing = async () => {
        const token = await getToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/following/${currUsername}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response for user data was not ok');
            }
            const userData = await response.json();

            const followingWithUsernames = userData.map(userData => ({
                username: userData.username,
                name: userData.name,
                profile_pic: userData.profile_pic
            }));
            console.log("following: ", followingWithUsernames);
            setFollowing(followingWithUsernames);
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const fetchUserProfile = async (username) => {
        const token = await getToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/username/${username}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
    }, [currUsername]);

    return (
        <View>
            <FlatList
                data={following}
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
                contentContainerStyle={{paddingBottom: 100}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    text: {
        fontWeight: 'bold', paddingBottom: 5, marginLeft: 8, marginTop: 15, fontSize: 20
    },
    name: {
        fontSize: 14, marginLeft: 8
    },
    image: {
        marginLeft: 8, marginTop: 5, width: 70, height: 70, borderRadius: 70 / 2, overflow: "hidden", borderWidth: 2
    }
})

export default FollowingScreen;