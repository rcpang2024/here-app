import { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, FlatList } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { UserContext } from "../user-context";
import EventItem from '../components/event-item';

const ExploreScreen = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const { user } = useContext(UserContext); // Access user from context
    const [friendsEvents, setFriendsEvents] = useState([]);

    const [routes] = useState([
        {key: 'first', title: 'FRIENDS ATTENDING'},
        {key: 'second', title: 'EVENTS NEARBY'},
    ]);

    // const fetchFriendsEvents = async () => {
    //     if (user && user.list_of_following.length > 0) {
    //         try {
    //             const response = await fetch(`http://192.168.1.142:8000/api/friendsevents`);
    //             const eventsData = await response.json();
    //             setFriendsEvents(eventsData);
    //         } catch (error) {
    //             console.log("Error fetching events: ", error);
    //         }
    //     }
    // };

    const fetchFriendsEvents = async (user) => {
        try {
            const response = await fetch(`http://192.168.1.142:8000/api/friendsevents`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch friends events');
            }
            const eventsData = await response.json();
            return eventsData;
        } catch (error) {
            console.error("Error fetching friends' events: ", error);
            return [];
        }
    };

    useEffect(() => {
        if (user) {
            fetchFriendsEvents(user).then(setFriendsEvents);
        }
    }, [user]);

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
    
    const friendsAttendingRoute = () => (
        <View>
            <FlatList
                data={friendsEvents}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventItem}
                ListEmptyComponent={<Text>No Events Found</Text>}
            />
        </View>
    );

    const exploreRoute = () => (
        <View>
            <Text>Find Interesting Events</Text>
        </View>
    );

    const renderScene = SceneMap({
        first: friendsAttendingRoute,
        second: exploreRoute
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