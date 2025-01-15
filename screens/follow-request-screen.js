import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useEffect, useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";

const FollowRequestScreen = () => {
    const navigation = useNavigation();

    const [followRequests, setFollowRequests] = useState([]);
    const { user, updateUserContext } = useContext(UserContext);

    const fetchListOfFollowRequests = async () => {
        const { theData } = await supabase.auth.getSession();
        const idToken = theData?.session.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/follow_requests/${user.username}/`, {
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
            const requests = userData.map(userData => ({
                username: userData.username,
                name: userData.name,
                profile_pic: userData.profile_pic,
                id: userData.id
            }));
            console.log("requests: ", requests);
            setFollowRequests(requests);
        } catch (e) {
            console.error('Error fetching usernames for attendees:', e);
        }
    };

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
        fetchListOfFollowRequests();
    }, []);

    const fetchUserProfile = async (username) => {
        const { theData } = await supabase.auth.getSession();
        const idToken = theData?.session.access_token;
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

    // ISSUE: Item is a username, but I need the ID of the user
    const handleAccept = async (item) => {
        const { theData } = await supabase.auth.getSession();
        const idToken = theData?.session.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/followuser/${item.username}/${user.username}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ follower: user.username }),
            });
            console.log("Item: ", item);
            if (response.ok) {
                const updatedUser = {
                    ...user,
                    list_of_followers: [...user.list_of_followers, item.id], // find a way to get user id
                };
                await updateUserContext(updatedUser);
                console.log("Follow accepted");
                setFollowRequests((prevRequests) => prevRequests.filter(req => req.id !== item.id));
            } else {
                console.log("Response not OK when accepting follow request");
            }
        } catch (e) {
            console.error("Failed to accept follow request: ", e);
        }
    };

    const handleDeny = async (item) => {
        const { theData } = await supabase.auth.getSession();
        const idToken = theData?.session.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/remove_request/${user.username}/${item.username}/`, {
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
                    follow_requests: user.follow_requests.filter(id => id !== item.id) // get user id
                };
                await updateUserContext(updatedUser);
                console.log("Follow rejected");
                setFollowRequests((prevRequests) => prevRequests.filter(req => req.id !== item.id));
            } else {
                console.error("Response error during rejecting follow request.");
            }
        } catch (e) {
            console.error("Error denying follow request: ", e);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.requestItem}>
            <TouchableOpacity onPress={() => handleUserPress(item.username)}>
                <View style={{flexDirection: 'row'}}>
                    <Image source={item.profile_pic ? {uri: item.profile_pic} : FallbackPhoto} style={styles.image}/>
                    <View>
                        <Text style={styles.text}>{item.username}</Text>
                        <Text style={styles.name}>{item.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => handleAccept(item)}>
                    <Text style={{fontSize: 18}}>ACCEPT</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeny(item)}>
                    <Text style={{fontSize: 18, color: 'red'}}>DENY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList 
                data={followRequests}
                keyExtractor={(item) => item.username}
                renderItem={renderItem}
                contentContainerStyle={{paddingBottom: 100}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, padding: 12
    },
    text: {
        fontWeight: 'bold', paddingBottom: 5, marginLeft: 8, marginTop: 5, fontSize: 24
    },
    name: {
        fontSize: 14, marginLeft: 8
    },
    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    buttonContainer: {
        flexDirection: 'row', justifyContent: 'space-between', width: 150
    },
    image: {
        marginTop: 5,
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
});

export default FollowRequestScreen