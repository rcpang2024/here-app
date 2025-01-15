import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable, RefreshControl, ScrollView,
    Modal, Alert } from "react-native";
import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../user-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
// import HereLogo from '../assets/images/HereLogo.png';
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import EventItem from "../components/event-item";
import UploadImage from "../components/upload-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const OtherProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    // User who is logged in
    const { user, updateUserContext } = useContext(UserContext); 
    const { profileUser } = route.params || {};
    const currUser = profileUser;
    const auth = FIREBASE_AUTH;
    const [idToken, setIdToken] = useState(null);

    const [isRequested, setIsRequested] = useState(user.requesting_users.includes(profileUser.id));
    const [followingStatus, setFollowingStatus] = useState(user.list_of_following.includes(profileUser.id));

    // For options modal
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [index, setIndex] = useState(0);

    // created is the array of all created events
    const [created, setCreated] = useState([]);
    // createdEvent is the individual created event
    const [createdEvent, setCreatedEvent] = useState('');

    // same structure as for created/createdEvent
    const [attending, setAttending] = useState([]);
    const [event, setEvent] = useState('');

    // Checks to see if the context user follows the other user
    const isPrivateUser = currUser.user_privacy === "private";

    const routes = useMemo(() => ([
        { key: 'first', title: 'PROFILE' },
        { key: 'second', title: 'CREATED EVENTS' },
        { key: 'third', title: 'ATTENDING EVENTS' },
    ]), []);

    const fetchEvent = async (eventId) => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/events/${eventId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response for event data was not ok');
            }
            const eventData = await response.json();
            return eventData;
        } catch (error) {
            console.error("fetchEventDetails error: ", error);
        }
    };

    const handleCreatedEvent = async () => {
        const createdPromises = created.map(async (eventId) => {
            if (typeof eventId === 'object') {
              return eventId;
            } else {
              try {
                const createdData = await fetchEvent(eventId);
                return createdData;
              } catch (error) {
                console.error('Error fetching event data:', error.message);
              }
            }
        });
        const createdDataArray = await Promise.all(createdPromises);
        const validCreatedEvents = createdDataArray.filter(event => event !== null);
        setCreatedEvent(validCreatedEvents);
    };

    const handleAttendingEvent = async () => {
        const eventDataPromises = attending.map(async (eventId) => {
            try {
                const eventData = await fetchEvent(eventId);
                return eventData;
            } catch (error) {
                console.error('Error fetching event data:', error.message);
            }
        });
        const eventDataArray = await Promise.all(eventDataPromises);
        const validAttendingEvents = eventDataArray.filter(event => event !== null);
        setEvent(validAttendingEvents);
    };

    useEffect(() => {
        console.log("isRequested: ", isRequested);
        if (profileUser) {
            setCreated(profileUser.created_events);
            setAttending(profileUser.attending_events);
            checkFollowRequestState();
        }
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
            headerRight: () => (
                <Ionicons
                    name="person"
                    size={28}
                    color="black"
                    onPress={() => setModalVisible(true)}
                    style={{marginRight: 16}}
                />
            ),
        });
        const fetchToken = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                alert("Error retrieving token: ", error);
            }
            const token = data?.session?.access_token;
            setIdToken(token);
            console.log("token set in otherprofilescreen");
        };
        fetchToken();
    }, [route.params, profileUser]);

    const onTabChange = (newIndex) => {
        setIndex(newIndex);
        if (newIndex === 1 && createdEvent.length === 0) {
            handleCreatedEvent();
        }
        else if (newIndex === 2 && event.length === 0) {
            handleAttendingEvent();
        }
    };

    const handleFollow = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            if (isPrivateUser && !followingStatus) {
                const followRequestResponse = await fetch(`http://192.168.1.6:8000/api/request_to_follow_user/${user.username}/${profileUser.username}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ follower: user.username }),
                });
                if (followRequestResponse.ok) {
                    const updatedUser = {
                        ...user,
                        requesting_users: [...user.requesting_users, profileUser.id]
                    };
                    setIsRequested(true);
                    await updateUserContext(updatedUser);
                    AsyncStorage.setItem(`isRequested_${profileUser.username}`, 'true');
                } else {
                    console.error("Failed to request to follow user.");
                }
            } else {
                const response = await fetch(`http://192.168.1.6:8000/api/followuser/${user.username}/${profileUser.username}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify({ follower: user.username }),
                });
                if (response.ok) {
                    // Update user context
                    const updatedUser = {
                        ...user,
                        list_of_following: [...user.list_of_following, profileUser.id],
                    };
                    setFollowingStatus(true);
                    await updateUserContext(updatedUser);
                } else {
                    console.error('Failed to follow the user');
                }
            }
        } catch (err) {
            console.error('Error when trying to follow user: ', err);
        }
    };

    const handleUnfollow = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/unfollowuser/${user.username}/${profileUser.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (response.ok) {
                // Update user context
                const updatedUser = {
                    ...user,
                    list_of_following: user.list_of_following.filter(id => id !== profileUser.id),
                };
                setFollowingStatus(false);
                setIsRequested(false);
                await updateUserContext(updatedUser);
            } else {
                console.error('Failed to unfollow the user');
            }
        } catch (err) {
            console.error('Error unfollowing user: ', err);
        }
    };

    const handleSettingNotifications = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/setnotification/${user.username}/${profileUser.username}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (response.ok) {
                const updatedUser = {
                    ...user,
                    subscriptions: [...user.subscriptions, profileUser.id],
                };
                await updateUserContext(updatedUser);
            }
        } catch (e) {
            console.error("Error setting notifications: ", e);
        }
    };

    const handleRemoveNotifications = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/removenotification/${user.username}/${profileUser.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (response.ok) {
                const updatedUser = {
                    ...user,
                    subscriptions: user.subscriptions.filter(id => id !== profileUser.id),
                };
                await updateUserContext(updatedUser);
            }
        } catch (e) {
            console.error("Error setting notifications: ", e);
        }
    };
    
    const handleRemoveFollower = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/unfollowuser/${profileUser.username}/${user.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (response.ok) {
                const updatedUser = {
                    ...user,
                    list_of_followers: user.list_of_followers.filter(id => id !== profileUser.id)
                };
                await updateUserContext(updatedUser);
            } else {
                console.error("Response for remove follower not OK");
            }
        } catch (e) {
            console.error("Error removing follower: ", e);
        }
    };

    const handleRemoveRequest = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            const removeRequestResponse = await fetch(`http://192.168.1.6:8000/api/remove_request/${user.username}/${profileUser.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (removeRequestResponse.ok) {
                const updatedUser = {
                    ...user,
                    // requesting_users: [...user.requesting_users, profileUser.id]
                    requesting_users: user.requesting_users.filter(id => id !== profileUser.id)
                };
                setIsRequested(false);
                await updateUserContext(updatedUser);
                await AsyncStorage.setItem(`isRequested_${profileUser.username}`, 'false');
            } else {
                console.error("Failed to request to follow user.");
            }
        } catch (e) {
            console.error("Error removing follow request: ", e);
        }
    };

    const handleBlockUser = async () => {
        // const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/blockuser/${user.username}/${profileUser.username}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (response.ok) {
                const updatedUser = {
                    ...user,
                    blocked_users: [...user.blocked_users, profileUser.id],
                };
                setFollowingStatus(false);
                setIsRequested(false);
                await updateUserContext(updatedUser);
            }
        } catch (e) {
            console.error("Error blocking user: ", e);
        }
    };

    const checkFollowRequestState = async () => {
        try {
            const value = await AsyncStorage.getItem(`isRequested_${profileUser.username}`);
            if (value === 'true') {
                setIsRequested(true);
            } else {
                setIsRequested(false);
            }
        } catch (error) {
            console.error('Error loading follow request state:', error);
        }
    };

    const renderEventItem = ({ item }) => {
        return (
            <View>
                <EventItem
                    event_id={item.id}
                    creation_user={item.creation_user}
                    creation_user_username={item.creation_user_username}
                    event_name={item.event_name}
                    event_description={item.event_description}
                    location_addr={item.location_addr}
                    date={item.date}
                    list_of_attendees={item.list_of_attendees}
                />
            </View>
        );
    };

    const confirmUnfollow = () => {
        Alert.alert(
            "Unfollow",
            "Are you sure you want to unfollow this user?",
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: handleUnfollow}]
        );
    };

    const confirmRemoveNotification = () => {
        Alert.alert(
            "Turn Off Notifications for this User", 
            "Are you sure you want to turn off notifications for this user?", 
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: handleRemoveNotifications}]
        );
    };

    const confirmRemoveFollower = () => {
        Alert.alert(
            "Remove Follower", 
            "Are you sure you want to remove this user as a follower?", 
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: handleRemoveFollower}]
        );
    };

    const confirmBlockingUser = () => {
        Alert.alert(
            "Block User", 
            "Are you sure you want to block this user?", 
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: handleBlockUser}]
        );
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        handleCreatedEvent();
        handleAttendingEvent();
        setRefreshing(false);
    }, []);

    const ProfileRoute = () => {
        return (
            <View style={{paddingTop: 10, marginRight: 15}}>
                <ScrollView 
                    refreshControl = {
                        <RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()}/>
                    }
                >
                    <View style={styles.title}>
                        {/* <Image source={HereLogo} style={styles.profilePic}/> */}
                        <UploadImage theURI={currUser.profile_pic} isEditable={false}/>
                        <Text style={styles.name}>{currUser.name}</Text>
                        <Text style={styles.username}>{currUser.username}</Text>
                        <View style={styles.follow}>
                            <Pressable onPress={() => navigation.push("Followers", { username: currUser.username })}>
                                {currUser.list_of_followers && (
                                    <View style={styles.text}>
                                        <Text style={{fontWeight:'bold'}}>FOLLOWERS</Text>
                                        <Text style={{fontWeight:'bold', marginTop: 2}}>{currUser.list_of_followers.length}</Text>
                                    </View>
                                )}
                            </Pressable>
                            <Pressable onPress={() => navigation.push("Following", { username: currUser.username })}>
                                {currUser.list_of_following && (
                                    <View style={styles.text}>
                                        <Text style={{fontWeight:'bold'}}>FOLLOWING</Text>
                                        <Text style={{fontWeight:'bold', marginTop: 2}}>{currUser.list_of_following.length}</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>
                        <Text style={styles.bio}>{currUser.bio}</Text>
                        {followingStatus ? (
                            <TouchableOpacity style={styles.unfollowUser} onPress={confirmUnfollow}>
                                <Text style={{fontWeight: 'bold', color: 'white'}}>UNFOLLOW</Text>
                            </TouchableOpacity>
                        ) : isRequested ? (
                            <TouchableOpacity style={styles.requestUser} onPress={handleRemoveRequest}>
                                <Text style={{fontWeight: 'bold', color: 'white'}}>REQUESTED</Text>
                            </TouchableOpacity>
                        ) : user.blocked_users.includes(profileUser.id) || profileUser.blocked_users.includes(user.id) ? (
                            <Text style={{fontWeight: 'bold', color: '#abb4c2', fontSize: 24}}>BLOCKED</Text>
                        ) : (
                            <TouchableOpacity style={styles.followUser} onPress={handleFollow}>
                                <Text style={{fontWeight: 'bold', color: 'white'}}>FOLLOW</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const CreatedEventsRoute = () => {
        return (
            <View>
                {user.created_events && (
                    <View style={{marginLeft: 10, marginRight: 20}}>
                        <FlatList
                            data={createdEvent}
                            keyExtractor={(item) => item.id}
                            renderItem={renderEventItem}
                            contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
                        />
                    </View>
                )}
            </View>
        );
    };

    const AttendingEventsRoute = () => {
        return (
            <View>
                {user.attending_events && (
                    <View style={{marginLeft: 10, marginRight: 18}}>
                        <FlatList 
                            data={event}
                            keyExtractor={(item) => item.id}
                            renderItem={renderEventItem}
                            contentContainerStyle={{paddingTop: 5, paddingBottom: 15}}
                        />
                    </View>
                )}
            </View>
        );
    };

    // Stores the state of the different tabs to prevent unnecessary re renders
    const MemoizedProfileRoute = useMemo(() => ProfileRoute, [user]);
    const MemoizedCreatedRoute = useMemo(() => CreatedEventsRoute, [createdEvent]);
    const MemoizedAttendingRoute = useMemo(() => AttendingEventsRoute, [event]);

    const renderScene = SceneMap({
        first: MemoizedProfileRoute,
        second: MemoizedCreatedRoute,
        third: MemoizedAttendingRoute
    });

    // Renders the tab bar
    const renderTabBar = (props) => {
        return (
            <View>
                {isPrivateUser && followingStatus == false ? (
                    <View>
                        <Text style={{fontSize: 16, alignSelf: 'center', fontWeight: 'bold', color: '#BD7979'}}>
                            PRIVATE - FOLLOW TO VIEW EVENTS
                        </Text>
                    </View>
                ) : profileUser.blocked_users.includes(user.id) || user.blocked_users.includes(profileUser.id) ? (
                    <View>
                        <Text style={{fontSize: 16, alignSelf: 'center', fontWeight: 'bold', color: '#BD7979'}}>
                            UNAVAILABLE
                        </Text>
                    </View>
                ) : (
                    <TabBar 
                        {...props}
                        indicatorStyle={{ backgroundColor: 'black' }}
                        style={{ backgroundColor: '#BD7979' }} 
                        renderLabel={({ route }) => (
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{route.title}</Text>
                        )}
                        
                    />
                )}
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <TabView
                lazy 
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={onTabChange}
                initialLayout={{ width: '90%' }}
                renderTabBar={renderTabBar}
                swipeEnabled={(!isPrivateUser && followingStatus) || (!isPrivateUser && !profileUser.blocked_users.includes(user.id))}
                style={{ marginTop: 4, padding: 10, color: 'black', justifyContent: 'center' }}
            />
             {modalVisible && (
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <View style={{backgroundColor: 'white', padding: 30, borderRadius: 10, alignItems: 'center'}}>
                            {(!user.subscriptions.includes(profileUser.id) && user.list_of_following.includes(profileUser.id)) ? (
                                <TouchableOpacity onPress={() => handleSettingNotifications()}>
                                    <Text style={{paddingBottom: 10, fontSize: 18}}>TURN ON NOTIFICATIONS</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={confirmRemoveNotification}>
                                    <Text style={{paddingBottom: 10, fontSize: 18}}>TURN OFF NOTIFICATIONS</Text>
                                </TouchableOpacity>
                            )}
                            {user.list_of_followers.includes(profileUser.id) && (
                                <TouchableOpacity onPress={confirmRemoveFollower}>
                                    <Text style={{paddingBottom: 10, fontSize: 18}}>REMOVE FOLLOWER</Text>
                                </TouchableOpacity>
                            )}
                            {!user.blocked_users.includes(profileUser.id) && (
                                <TouchableOpacity onPress={confirmBlockingUser}>
                                    <Text style={{paddingBottom: 10, fontSize: 18}}>BLOCK USER</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={{color: 'red', fontSize: 18}}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10, alignItems: 'center'
    },
    profilePic: {
        borderRadius: 50, width: 150, height: 150, marginBottom: 10
    },
    name: {
        fontSize: 26, fontWeight: 'bold'
    },
    username: {
        fontSize: 18, color: 'grey', paddingBottom: 5
    },
    bio: {
        fontSize: 15, paddingLeft: 10, paddingRight: 10, paddingTop: 15, paddingBottom: 10, alignItems: 'center'
    },
    text: {
        borderWidth: 3, borderColor: 'black', borderRadius: 5, padding: 7, fontWeight: 'bold', marginRight: 20, alignItems: 'center'
    },
    follow: {
        flexDirection: 'row', marginTop: 10, marginLeft: 10
    },
    viewPager: {
        width: '100%', backgroundColor: 'red'
    },
    flatListContainer: {
        flex: 1, marginBottom: 10
    },
    followUser: {
        borderColor: '#5ADAD8',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#5ADAD8'
    },
    requestUser: {
        borderColor: '#abb4c2',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#abb4c2'
    },
    unfollowUser: {
        borderColor: '#EC6C6C',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#EC6C6C'
    }
})

export default OtherProfileScreen;