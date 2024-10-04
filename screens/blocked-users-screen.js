import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const BlockedUsersScreen = () => {
    const navigation = useNavigation();
    const { user, updateUserContext } = useContext(UserContext);
    const auth = FIREBASE_AUTH;
    const [idToken, setIdToken] = useState(null);

    const [blockedUserUsernames, setBlockedUserUsernames] = useState([]);

    const fetchUsernamesForBlockedUsers = async () => {
        try {
            if (user.blocked_users) {
                const blockedUsersWithUsernames = await Promise.all(
                    user.blocked_users.map(async (userID) => {
                    const response = await fetch(`http://192.168.1.6:8000/api/users/id/${userID}/`, {
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
                    // return userData.username;
                    return {username: userData.username, id: userID}
                })
                );
                setBlockedUserUsernames(blockedUsersWithUsernames);
            } else {
                console.log("No blocked users present");
            }
        } catch (error) {
            console.error('Error fetching usernames for blocked users:', error);
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
        const fetchToken = async () => {
            const token = await auth.currentUser.getIdToken();
            setIdToken(token);
            console.log("idToken set in blocked users screen");
        };
        fetchToken();
        fetchUsernamesForBlockedUsers();
    }, []);

    const fetchUserProfile = async (username) => {
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
            <TouchableOpacity onPress={() => handleUserPress(item.username)}>
                <Text style={styles.text}>{item.username}</Text>
            </TouchableOpacity>
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
                keyExtractor={(item) => item.id.toString()}
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
    buttonContainer: {
        flexDirection: 'row', justifyContent: 'space-between', paddingRight: 7
    },
    text: {
        fontWeight: 'bold', paddingBottom: 5, marginLeft: 8, marginTop: 5, fontSize: 24,
    },
    unblock: {
        paddingBottom: 5, color: 'red', marginLeft: 10, marginTop: 8, fontSize: 24,
    }
})

export default BlockedUsersScreen;