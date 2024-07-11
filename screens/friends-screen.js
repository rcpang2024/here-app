import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, FlatList, RefreshControl } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { UserContext } from "../user-context";
import EventItem from '../components/event-item';

const ExploreScreen = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [friendsEvents, setFriendsEvents] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const { user } = useContext(UserContext); // Access user from context

    // const [routes] = useState([
    //     {key: 'first', title: 'FRIENDS ATTENDING'},
    //     {key: 'second', title: 'EVENTS NEARBY'},
    // ]);

    const routes = useMemo(() => ([
        {key: 'first', title: 'FRIENDS ATTENDING'},
        {key: 'second', title: 'EVENTS NEARBY'},
    ]), []);

    useEffect(() => {
        if (user) {
            fetchFriendsAttending();
        }
    }, [user]);

    const fetchFriendsAttending = async () => {
        try {
            const response = await fetch(`http://192.168.1.142:8000/api/friends_attending_events/${user.username}/`);
            const data = await response.json();
            setFriendsEvents(data);
        } catch (e) {
            console.error("Error retrieving friends' attending events: ", e);
        }
    };

    const renderEventItem = ({ item }) => (
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFriendsAttending()
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
                ListEmptyComponent={<Text>No Events Found</Text>}
                contentContainerStyle={{ paddingTop: 10, paddingBottom: 15, marginRight: 10 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => onRefresh()}
                    />
                }
            />
        </View>
    );

    const ExploreRoute = () => (
        <View>
            <Text>Find Interesting Events</Text>
        </View>
    );

    const MemoizedFriendsAttendingRoute = useMemo(() => FriendsAttendingRoute, [friendsEvents]);
    const MemoizedExploreRoute = useMemo(() => ExploreRoute, []);

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
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
                style={{marginTop: 10, padding: 10}}
            />
        </View>
    );
}

function padding(a, b, c, d) {
    return {
      paddingTop: a,
      paddingBottom: c !== undefined ? c : a,
      paddingRight: b !== undefined ? b : a,
      paddingLeft: d !== undefined ? d : (b !== undefined ? b : a)
    }
}

const styles = StyleSheet.create({
    title: {
        ...padding(10, 0, 0, 10),
        fontSize: 32
    },
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '60%',
    },
    search: {
        backgroundColor: 'FFF',
        width: 250,
        height: 60,
        borderWidth: 1,
        borderColor: '#C0C0C0',
        // borderTopLeftRadius: 40,
        // borderBottomLeftRadius: 40,
    },
    searchInput: {
        marginLeft: 10,
        marginTop: 5,
        fontSize: 16,
    },
    searchButton: {
        flexDirection: 'row',
        color: 'grey',
    },
})

export default ExploreScreen;