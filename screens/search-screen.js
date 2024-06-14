import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { SearchBar } from "react-native-elements";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import EventItem from "../components/event-item";

const SearchScreen = () => {
    const [searchUser, setUserSearch] = useState('');
    const [searchEvent, setEventSearch] = useState('');
    // For Users
    const [results, setResults] = useState([]);
    // For Events
    const [eventResults, setEventResults] = useState([]);

    const [index, setIndex] = useState(0);
    const [userSearchCache, setUserSearchCache] = useState({});
    const [eventSearchCache, setEventSearchCache] = useState({});

    const routes = useMemo(() => ([
        { key: 'first', title: 'SEARCH USERS' },
        { key: 'second', title: 'SEARCH EVENTS' },
    ]), []);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const searchDatabase = async (query) => {
        if (userSearchCache[query]) {
            setResults(userSearchCache[query]);
            return;
        }
        try {
            // Placeholder 
            const response = await fetch(`http://192.168.1.142:8000/api/searchusers?query=${query}`);
            const data = await response.json();
            setUserSearchCache((prevCache) => ({ ...prevCache, [query]: data }));
            setResults(data);
        } catch (error) {
            console.error("Error searching the database: ", error);
        }
    };

    const searchEventDatabase = async (query) => {
        if (eventSearchCache[query]) {
            setEventResults(eventSearchCache[query]);
            return;
        }
        try {
            // Placeholder
            const eventResponse = await fetch(`http://192.168.1.142:8000/api/searchevents?query=${query}`);
            const eventData = await eventResponse.json();
            console.log(eventData);
            setEventSearchCache((prevCache) => ({ ...prevCache, [query]: eventData }));
            setEventResults(eventData);
        } catch (error) {
            console.error("Error looking for events: ", error);
        }
    };
    
    // useEffect(() => {
    //     if (index === 0 && searchUser.length > 0) {
    //         searchDatabase(searchUser);
    //     } else if (index === 1 && searchEvent.length > 0) {
    //         searchEventDatabase(searchEvent);
    //     }
    // }, [searchUser, searchEvent, index]);

    const renderUserItem = ({ item }) => {
        return (
            <View>
                <TouchableOpacity onPress={() => console.log(item.username)}>
                    <Text style={styles.resultText}>{item.username}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEventItem = ({ item }) => {
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
    
    const handleUserSearchChange = useCallback((text) => {
        setUserSearch(text);
        if (text.length > 0) {
            searchDatabase(text);
        } else {
            setResults([]);
        }
    }, [userSearchCache]);

    const handleEventSearchChange = useCallback((text) => {
        setEventSearch(text);
        if (text.length > 0) {
            searchEventDatabase(text);
        } else {
            setEventResults([]);
        }
    }, [eventSearchCache]);

    // Keyboard disappearance issue was b/c the search bar was being re-rendered everytime input change
    // SOLUTION (for now): put search bar outside of TabView
    const SearchUserRoute = useMemo(() => () => (
        <View>
            <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
            />
        </View>
    ), [results]);
    
    const SearchEventRoute = useMemo(() => () => (
        <View>
            <FlatList
                data={eventResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderEventItem}
                contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
            />
        </View>
    ), [eventResults]);

    // const SearchUserRoute = () => {
    //     return (
    //         <View>
    //             <SearchBar
    //                 placeholder="Search for users"
    //                 onChangeText={setUserSearch}
    //                 value={searchUser}
    //             />
    //             <FlatList
    //                 data={results}
    //                 KeyExtractor={(item) => item.id}
    //                 renderItem={renderUserItem}
    //                 contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
    //             />
    //         </View>
    //     );
    // };

    // const SearchEventRoute = () => {
    //     return (
    //         <View>
    //             <SearchBar
    //                 placeholder="Search for events"
    //                 onChangeText={setEventSearch}
    //                 value={searchEvent}
    //             />
    //             <FlatList
    //                 data={eventResults}
    //                 KeyExtractor={(item) => item.id}
    //                 renderItem={renderEventItem}
    //                 contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
    //             />
    //         </View>
    //     );
    // };

    const renderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{backgroundColor: 'black'}}
                renderLabel={({ route }) => (
                    <Text style={{color: 'black', fontWeight: 'bold'}}>{route.title}</Text>
                )}
            />
        );
    };

    const renderSearchScene = SceneMap({
        first: SearchUserRoute,
        second: SearchEventRoute
    });

    return (
        <View style={{ flex: 1 }}>
            <SearchBar
                placeholder={index === 0 ? "Search for friends" : "Search for events"}
                onChangeText={index === 0 ? handleUserSearchChange : handleEventSearchChange}
                value={index === 0 ? searchUser : searchEvent}
            />
            <TabView
                lazy
                navigationState={{ index, routes }}
                renderScene={renderSearchScene}
                onIndexChange={setIndex}
                initialLayout={{ width: '100%' }}
                renderTabBar={renderTabBar}
                style={{ marginTop: 4, padding: 1, color: 'black' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    resultText: {
        fontSize: 20,
        padding: 10
    }
})

export default SearchScreen;