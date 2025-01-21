import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, FlatList, RefreshControl } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { UserContext } from "../user-context";
import EventItem from '../components/event-item';
import { supabase } from "../lib/supabase";
// import { FIREBASE_AUTH } from "../FirebaseConfig";

const ExploreScreen = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [friendsEvents, setFriendsEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const [nearbyEvents, setNearbyEvents] = useState([]);
    const { user, userLocation } = useContext(UserContext); 
    // const [idToken, setIdToken] = useState(null);

    const routes = useMemo(() => ([
        {key: 'first', title: 'FRIENDS ATTENDING'},
        {key: 'second', title: 'EVENTS NEARBY'},
    ]), []);

    useEffect(() => {
        // const fetchToken = async () => {
        //     const { data, error } = await supabase.auth.getSession();
        //     if (error) {
        //         alert("Error fetching friends' events: ", error);
        //     }
        //     const token = data?.session?.access_token;
        //     setIdToken(token);
        // };
        // fetchToken();
        if (user) {
            fetchFriendsAttending();
        }
    }, [user]);

    const onTabChange = (newIndex) => {
        setIndex(newIndex);
        // if (newIndex === 1) {
        //     fetchNearbyEvents();
        // }
    };

    const fetchFriendsAttending = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        console.log("idToken in fetchFriendsAttending: ", idToken);
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/friends_attending_events/${user.username}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const theData = await response.json();
            setFriendsEvents(theData);
        } catch (e) {
            console.error("Error retrieving friends' attending events: ", e);
        }
    };

    const fetchNearbyEvents = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        console.log("idToken in fetchNearbyEvents: ", idToken);
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/nearby_events/${userLocation.latitude}/${userLocation.longitude}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            const theData = await response.json();
            setNearbyEvents(theData);
        } catch (e) {
            console.error("Error retrieving nearby events: ", e);
        }
    };

    const renderEventItem = ({ item }) => (
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFriendsAttending();
        fetchNearbyEvents();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);
    
    const FriendsAttendingRoute = () => (
        <View>
            <FlatList
                data={friendsEvents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventItem}
                ListEmptyComponent={<Text>No Events Found!</Text>}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 15, marginRight: 10 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()}/>
                }
            />
        </View>
    );

    const ExploreRoute = () => (
        <View>
            <FlatList
                data={nearbyEvents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventItem}
                ListEmptyComponent={<Text>No Events Found</Text>}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 15, marginRight: 10 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => onRefresh()}/>
                }
            />
        </View>
    );

    const MemoizedFriendsAttendingRoute = useMemo(() => FriendsAttendingRoute, [friendsEvents]);
    const MemoizedExploreRoute = useMemo(() => ExploreRoute, [nearbyEvents]);

    const renderScene = SceneMap({
        first: MemoizedFriendsAttendingRoute,
        second: MemoizedExploreRoute
    });

    const renderTabBar = (props) => {
        return (
            <TabBar 
                {...props}
                indicatorStyle={{ backgroundColor: 'black' }}
                style={{ backgroundColor: '#BD7979' }}
                renderLabel={({ route }) => (
                    <Text style={{color: 'white', fontWeight: 'bold'}}>{route.title}</Text>
                )}
            />
        );
    };

    return (
        <View style={styles.container}>
            <TabView 
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={onTabChange}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
                style={{marginTop: 10, padding: 10}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        width: '100%', height: '60%'
    },
    search: {
        backgroundColor: 'FFF', width: 250, height: 60, borderWidth: 1, borderColor: '#C0C0C0'
    },
    searchInput: {
        marginLeft: 10, marginTop: 5, fontSize: 16
    },
    searchButton: {
        flexDirection: 'row', color: 'grey'
    },
})

export default ExploreScreen;