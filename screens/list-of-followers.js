import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import HereLogo from '../assets/images/HereLogo.png';
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const FollowersScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);
    const auth = FIREBASE_AUTH;

    const currUsername = route.params.username;
    const [followers, setFollowers] = useState([]);

    const fetchFollowers = async () => {
        const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/followers/${currUsername}/`, {
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
            const followersWithUsernames = userData.map(userData => ({
                username: userData.username,
                name: userData.name,
                profile_pic: userData.profile_pic
            }));
            console.log("followers: ", followersWithUsernames);
            setFollowers(followersWithUsernames);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };

    const fetchUserProfile = async (username) => {
        const idToken = await auth.currentUser.getIdToken();
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
        console.log("followers screen handleUserPress: ", username);
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
        setFollowers([]);
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
        fetchFollowers();
    }, [currUsername]);

    return (
        <View>
            <FlatList
                data={followers}
                keyExtractor={(item) => item.username}
                renderItem={({ item }) => 
                <TouchableOpacity onPress={() => handleUserPress(item.username)}>
                    <View style={{flexDirection: 'row'}}>
                        <Image source={item.profile_pic} style={styles.image}/>
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
        marginLeft: 8,
        marginTop: 5,
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
})

export default FollowersScreen;