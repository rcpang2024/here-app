import { View, Text, FlatList, StyleSheet, TouchableOpacity, Pressable, 
    RefreshControl, ScrollView, Alert } from "react-native";
import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../user-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import EventItem from "../components/event-item";
import UploadImage from "../components/upload-image";
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';
import { getToken } from "../secureStorage";

const ProfileScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user, updateUserContext } = useContext(UserContext); // User who is logged in
    const { profileUser } = route.params || {};
    const currUser = profileUser || user;

    const [refreshing, setRefreshing] = useState(false);
    const [index, setIndex] = useState(0);

    const [created, setCreated] = useState([]); // created is the array of all created events
    const [createdEvent, setCreatedEvent] = useState(''); // createdEvent is the individual created event

    // same structure as for created/createdEvent
    const [attending, setAttending] = useState([]);
    const [event, setEvent] = useState('');

    const routes = useMemo(() => ([
        { key: 'first', title: 'PROFILE' },
        { key: 'second', title: 'CREATED EVENTS' },
        { key: 'third', title: 'ATTENDING EVENTS' },
    ]), []);

    const fetchEvent = async (eventId) => {
        const token = await getToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/events/${eventId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
        // const fetchToken = async () => {
        //     const token = await getToken();
        //     if (token) {
        //         setIdToken(token);
        //     } else {
        //         Alert.alert("Error", "Authentication required. Try logging in again.");
        //     }
        // };
        // fetchToken();
        if (currUser) {
            setCreated(currUser.created_events);
            setAttending(currUser.attending_events);
        }
        if (currUser === user) {
            navigation.setOptions({
                headerRight: () => (
                    <Ionicons
                        name="reorder-three-outline"
                        size={32}
                        color="black"
                        onPress={() => navigation.navigate("Settings")}
                        style={{ marginRight: 14 }}
                    />
                ),
                headerLeft: () => (
                    <Ionicons 
                        name="create-outline" 
                        size={26} 
                        color="black" 
                        onPress={() => navigation.navigate("Message")}
                        style={{marginLeft: 14}}
                    />
                )
            });
        } else {
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
        }
    }, [route.params, currUser]);

    const onTabChange = (newIndex) => {
        setIndex(newIndex);
        if (newIndex === 1 && createdEvent.length === 0) {
            handleCreatedEvent();
        }
        else if (newIndex === 2 && event.length === 0) {
            handleAttendingEvent();
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        handleCreatedEvent();
        handleAttendingEvent();
        setRefreshing(false);
    }, []);

    const ProfileRoute = () => {
        if (!user) {
            return (
                <View>
                    <Text>User is not signed in</Text>
                </View>
            );
        }
        return (
            <View style={{paddingTop: 10, marginRight: 15}}>
                <ScrollView 
                    refreshControl = {
                        <RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()}/>
                    }
                >
                    <View style={styles.title}>
                        {/* <Image source={HereLogo} style={styles.profilePic}/> */}
                        <UploadImage theURI={currUser.profile_pic} isEditable={true}/>
                        <Text style={styles.name}>{currUser.name}</Text>
                        <Text style={styles.username}>{currUser.username}</Text>
                        <View style={styles.follow}>
                            <Pressable onPress={() => navigation.navigate("Followers", { username: currUser.username })}>
                                {currUser.list_of_followers && (
                                    <View style={styles.text}>
                                        <Text style={{fontWeight:'bold'}}>FOLLOWERS</Text>
                                        <Text style={{fontWeight:'bold', marginTop: 2}}>{currUser.list_of_followers.length}</Text>
                                    </View>
                                )}
                            </Pressable>
                            <Pressable onPress={() => navigation.navigate("Following", { username: currUser.username })}>
                                {currUser.list_of_following && (
                                    <View style={styles.text}>
                                        <Text style={{fontWeight:'bold'}}>FOLLOWING</Text>
                                        <Text style={{fontWeight:'bold', marginTop: 2}}>{currUser.list_of_following.length}</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>
                        <Text style={styles.bio}>{currUser.bio}</Text>
                        {currUser === user && (
                            <TouchableOpacity style={styles.editProfile} onPress={() => navigation.navigate('Edit Profile', {
                                name: user.name,
                                username: user.username,
                                bio: user.bio,
                                email: user.email,
                                pw: user.password
                            })}>
                                <Text style={{fontWeight: 'bold'}}>EDIT PROFILE</Text>
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
                    <View style={{marginLeft: scale(5), marginRight: scale(20)}}>
                        <FlatList 
                            data={event}
                            keyExtractor={(item) => item.id}
                            renderItem={renderEventItem}
                            contentContainerStyle={{paddingTop: verticalScale(5), paddingBottom: verticalScale(15)}}
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
            <TabBar 
                {...props}
                indicatorStyle={{ backgroundColor: 'black' }}
                style={{ backgroundColor: '#BD7979' }} 
                renderLabel={({ route}) => (
                    <Text style={{color: 'white', fontWeight: 'bold'}}>{route.title}</Text>
                )}
            />
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
            style={{marginTop: 4, padding: 10, color: 'black'}}
        />
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10, alignItems: 'center'
    },
    profilePic: {
        borderRadius: 30, width: scale(70), height: verticalScale(70), marginBottom: 10
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
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 5,
        padding: 7,
        fontWeight: 'bold',
        marginRight: 20,
        alignItems: 'center',
    },
    follow: {
        flexDirection: 'row', marginTop: 10, marginLeft: 10
    },
    editProfile: {
        borderColor: 'black', borderRadius: 2, borderWidth: 3, padding: 10, marginTop: 10
    }
})

export default ProfileScreen;