import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from "react-native";
import { useEffect, useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";

const FollowRequestScreen = () => {
    const navigation = useNavigation();

    const [followRequests, setFollowRequests] = useState([]);
    const { user, updateUserContext } = useContext(UserContext);

    const fetchListOfFollowRequests = async () => {
        try {
            const requestersWithUsernames = await Promise.all(
                user.follow_requests.map(async (followerID) => {
                const response = await fetch(`http://192.168.1.6:8000/api/users/id/${followerID}/`);
                if (!response.ok) {
                    throw new Error('Network response for user data was not ok');
                }
                const userData = await response.json();
                return userData.username;
            })
        );
        setFollowRequests(requestersWithUsernames);
        } catch (error) {
            console.error('Error fetching follow requests:', error);
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

    const renderItem = ({ item }) => (
        <View style={styles.requestItem}>
            <TouchableOpacity>
                <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => console.log("Accepted")}>
                    <Text style={{fontSize: 18}}>ACCEPT</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Denied")}>
                    <Text style={{fontSize: 18, color: 'red'}}>DENY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList 
                data={followRequests}
                keyExtractor={(item) => item}
                renderItem={renderItem}
                contentContainerStyle={{paddingBottom: 100}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12
    },
    text: {
        fontWeight: 'bold',
        paddingBottom: 5,
        marginLeft: 8,
        marginTop: 5,
        fontSize: 24,
    },
    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 150,
    },
});

export default FollowRequestScreen