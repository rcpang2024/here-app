import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Image } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const BlockedUsersScreen = () => {
    const navigation = useNavigation();
    const { user, updateUserContext } = useContext(UserContext);

    const [blockedUserUsernames, setBlockedUserUsernames] = useState([]);

    const fetchUsernamesForBlockedUsers = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/blocked/${user.username}/`, {
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
            const blocked = userData.map(userData => ({
                username: userData.username,
                name: userData.name,
                profile_pic: userData.profile_pic,
                id: userData.id
            }));
            console.log("blocked: ", blocked);
            setBlockedUserUsernames(blocked);
        } catch (e) {
            console.error("Error retrieving blocked users: ", e);
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
        fetchUsernamesForBlockedUsers();
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

    const handleUnblockUser = async (item) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/unblockuser/${user.username}/${item.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                // body: JSON.stringify({ follower: user.username })
            });
            if (response.ok) {
                const updatedUser = {
                    ...user,
                    blocked_users: user.blocked_users.filter(id => id !== item.id) // get user id
                };
                await updateUserContext(updatedUser);
                setBlockedUserUsernames((prevRequests) => prevRequests.filter(req => req.id !== item.id));
            }
        } catch (e) {
            console.error("Error unblocking user: ", e);
        }
    };

    const confirmUnblock = (item) => {
        Alert.alert(
            "Unblock User", 
            "Are you sure you want to unblock this user?", 
            [
                {text: "No", onPress: () => {}, style: 'cancel'},
                {text: "Yes", onPress: () => handleUnblockUser(item)}
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.requestItem}>
            <View style={styles.userContainer}>
                <Image source={item.profile_pic ? {uri: item.profile_pic} : FallbackPhoto} style={styles.image}/>
                <TouchableOpacity onPress={() => handleUserPress(item.username)}>
                    <Text style={styles.text}>{item.username}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => confirmUnblock(item)}>
                    <Text style={{fontSize: 18}}>UNBLOCK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View>
            <FlatList
                data={blockedUserUsernames}
                keyExtractor={(item) => item.username}
                renderItem={renderItem}
                refreshControl = {
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => console.log('Refreshing blocked users list')}
                    />
                }
                contentContainerStyle={{paddingBottom: 100}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userContainer: {
        flexDirection: 'row', alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: 'row', justifyContent: 'space-between', paddingRight: 7
    },
    text: {
        fontWeight: 'bold', paddingBottom: 5, marginLeft: 8, marginTop: 5, fontSize: 20,
    },
    image: {
        marginLeft: 8,
        marginTop: 5,
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
})

export default BlockedUsersScreen;