import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, 
    TouchableOpacity, Image } from "react-native";
import { useState, useMemo, useCallback, useContext } from "react";
import { SearchBar } from "react-native-elements";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useNavigation } from "@react-navigation/native";
import EventItem from "../components/event-item";
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const SearchScreen = () => {
    const navigation = useNavigation();
    const [searchUser, setUserSearch] = useState('');
    const [searchEvent, setEventSearch] = useState('');
    const { user } = useContext(UserContext);
    const auth = FIREBASE_AUTH;

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
            const response = await fetch(`http://192.168.1.6:8000/api/searchusers?query=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
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
            const eventResponse = await fetch(`http://192.168.1.6:8000/api/searchevents?query=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const eventData = await eventResponse.json();
            setEventSearchCache((prevCache) => ({ ...prevCache, [query]: eventData }));
            setEventResults(eventData);
        } catch (error) {
            console.error("Error looking for events: ", error);
        }
    };

    const fetchUserProfile = async (username) => {
        try {
            const idToken = await auth.currentUser.getIdToken();
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

    const renderUserItem = ({ item }) => {
        return (
            <View style={{paddingBottom: 5}}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                        onPress={() => handleUserPress(item.username)} 
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Image 
                            source={item.profile_pic ? { uri: item.profile_pic } : FallbackPhoto} 
                            style={styles.image} 
                        />
                        <View>
                            <Text style={styles.resultText}>{item.username}</Text>
                            <Text style={{fontSize: 12, marginLeft: 10}}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
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
            {searchUser !== '' && results.length === 0 ? (
            <Text style={{fontSize: 20, padding: 5}}>No results found...</Text>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
                />
            )}
        </View>
    ), [results]);
    
    const SearchEventRoute = useMemo(() => () => (
        <View>
            {searchEvent !== '' && eventResults.length === 0 ? (
                <Text style={{fontSize: 20, padding: 5}}>No results found...</Text>
            ) : (
                <FlatList
                    data={eventResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderEventItem}
                    contentContainerStyle={{ paddingTop: 5, paddingBottom: 15, marginLeft: 8, marginRight: 1 }}
                />
            )}
        </View>
    ), [eventResults]);

    const renderTabBar = (props) => {
        return (
            <TabBar
                {...props}
                indicatorStyle={{backgroundColor: 'black'}}
                style={{ backgroundColor: '#BD7979' }} 
                renderLabel={({ route }) => (
                    <Text style={{color: 'white', fontWeight: 'bold'}}>{route.title}</Text>
                )}
            />
        );
    };

    const renderSearchScene = SceneMap({
        first: SearchUserRoute,
        second: SearchEventRoute
    });

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={{ flex: 1 }}>
                <SearchBar
                    placeholder={index === 0 ? "Search for friends" : "Search for events"}
                    placeholderTextColor={index === 0 ? 'gray' : 'black'}
                    onChangeText={index === 0 ? handleUserSearchChange : handleEventSearchChange}
                    inputStyle={styles.searchBarInput}
                    value={index === 0 ? searchUser : searchEvent}
                    style={index === 0 ? styles.searchBarUser : styles.searchBarEvent}
                    clearIcon={{size: 28, borderRadius: 3, padding: 3}}
                    autoCapitalize="none"
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
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    resultText: {
        fontSize: 18, paddingBottom: 5, marginLeft: 10, fontWeight: 'bold'
    },
    searchBarUser: {
        backgroundColor: '#f0f0f0', borderRadius: 5, padding: 5
    },
    searchBarEvent: {
        backgroundColor: '#E68D8D', borderRadius: 5, padding: 5
    },
    searchBarInput: {
        fontSize: 18, color: 'black'
    },
    image: {
        marginLeft: 8,
        marginTop: 5,
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
})

export default SearchScreen;