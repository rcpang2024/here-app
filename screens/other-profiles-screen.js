import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Pressable, RefreshControl, ScrollView,
    Modal } from "react-native";
import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../user-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
// PLACEHOLDER
import HereLogo from '../assets/images/HereLogo.png';
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import EventItem from "../components/event-item";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OtherProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    // User who is logged in
    const { user, updateUserContext } = useContext(UserContext); 
    const { profileUser } = route.params || {};
    const currUser = profileUser;

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
    const isFollowing = currUser.list_of_followers.includes(user.id);

    const routes = useMemo(() => ([
        { key: 'first', title: 'PROFILE' },
        { key: 'second', title: 'CREATED EVENTS' },
        { key: 'third', title: 'ATTENDING EVENTS' },
    ]), []);

    const fetchEvent = async (eventId) => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/events/${eventId}/`);
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

    // FIX THIS LATER: MODAL DOESN'T SHOW UP RN
    const renderModal = () => {
        return (
            <View>
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={setModalVisible(false)}
                >
                    <TouchableOpacity>
                        <Text>BLOCK USER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Text>CANCEL</Text>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
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
    }, [route.params, profileUser]);

    useEffect(() => {
        console.log("isRequested has changed:", isRequested);
    }, [isRequested]);

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
        try {
            if (isPrivateUser && !isFollowing) {
                const followRequestResponse = await fetch(`http://192.168.1.6:8000/api/request_to_follow_user/${user.username}/${profileUser.username}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
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
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/unfollowuser/${user.username}/${profileUser.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ follower: user.username }),
            });
            if (response.ok) {
                // Update user context
                const updatedUser = {
                    ...user,
                    list_of_following: user.list_of_following.filter(id => id !== profileUser.id),
                };
                setFollowingStatus(false);
                await updateUserContext(updatedUser);
            } else {
                console.error('Failed to unfollow the user');
            }
        } catch (err) {
            console.error('Error unfollowing user: ', err);
        }
    };

    const handleRemoveRequest = async () => {
        try {
            const removeRequestResponse = await fetch(`http://192.168.1.6:8000/api/remove_request/${user.username}/${profileUser.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ follower: user.username })
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

    const renderCreate = ({ item }) => {
        return (
            <View>
                <EventItem
                    event_id={item.id}
                    creation_user={item.creation_user}
                    event_name={item.event_name}
                    event_description={item.event_description}
                    location={item.location}
                    date={item.date}
                    list_of_attendees={item.list_of_attendees}
                />
            </View>
        );
    };

    const renderAttending = ({ item }) => {
        return (
            <View>
                <EventItem
                    event_id={item.id}
                    creation_user={item.creation_user}
                    event_name={item.event_name}
                    event_description={item.event_description}
                    location={item.location}
                    date={item.date}
                    list_of_attendees={item.list_of_attendees}
                />
            </View>
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
                        <Image source={HereLogo} style={styles.profilePic}/>
                        <Text style={styles.name}>{currUser.name}</Text>
                        <Text style={styles.username}>{currUser.username}</Text>
                        <View style={styles.follow}>
                            <Pressable onPress={() => navigation.navigate("Followers", { followers: currUser.list_of_followers })}>
                                {currUser.list_of_followers && (
                                    <View style={styles.text}>
                                        <Text style={{fontWeight:'bold'}}>FOLLOWERS</Text>
                                        <Text style={{fontWeight:'bold', marginTop: 2}}>{currUser.list_of_followers.length}</Text>
                                    </View>
                                )}
                            </Pressable>
                            <Pressable onPress={() => navigation.navigate("Following", { following: currUser.list_of_following })}>
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
                            <TouchableOpacity style={styles.unfollowUser} onPress={handleUnfollow}>
                                <Text style={{fontWeight: 'bold', color: 'white'}}>UNFOLLOW</Text>
                            </TouchableOpacity>
                        ) : isRequested ? (
                            <TouchableOpacity style={styles.requestUser} onPress={handleRemoveRequest}>
                                <Text style={{fontWeight: 'bold', color: 'white'}}>REQUESTED</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.followUser} onPress={handleFollow}>
                                <Text style={{fontWeight: 'bold', color: 'white'}}>FOLLOW</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* {renderModal()} */}
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
                            renderItem={renderCreate}
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
                            renderItem={renderAttending}
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
        <TabView
            lazy 
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={onTabChange}
            initialLayout={{ width: '90%' }}
            renderTabBar={renderTabBar}
            swipeEnabled={!isPrivateUser || isFollowing} // conditionally enable or disable swiping
            style={{ marginTop: 4, padding: 10, color: 'black', justifyContent: 'center' }}
        />
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10,
        alignItems: 'center',
    },
    profilePic: {
        borderRadius: 50,
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 18,
        color: 'grey',
        paddingBottom: 5,
    },
    bio: {
        fontSize: 15,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 15,
        paddingBottom: 10,
        alignItems: 'center',
    },
    text: {
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 5,
        padding: 7,
        fontWeight: 'bold',
        marginRight: 20,
        alignItems: 'center',
    },
    follow: {
        flexDirection: 'row',
        marginTop: 10,
        marginLeft: 10,
    },
    viewPager: {
        width: '100%',
        backgroundColor: 'red',
    },
    flatListContainer: {
        flex: 1,
        marginBottom: 10,
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
        backgroundColor: '#5ADAD8',
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
        backgroundColor: '#abb4c2',
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
        backgroundColor: '#EC6C6C',
    }
})

export default OtherProfileScreen;