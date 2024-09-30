import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { useEffect, useState, useCallback, useContext } from "react";
import EventItem from "../components/event-item";
import { UserContext } from "../user-context";
import * as Location from 'expo-location';
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { user, updateUserLocation } = useContext(UserContext);
    const auth = FIREBASE_AUTH;

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Ionicons
                    name="notifications"
                    size={28}
                    color="black"
                    onPress={() => navigation.navigate("Notifications")}
                    style={{ marginRight: 16 }}
                />
            )
        });
        fetchData();
        const getPermissions = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log("Please grant location permissions")
                return;
            }
            let currLocation = await Location.getCurrentPositionAsync({});
            updateUserLocation(currLocation.coords);
            // setLocation(currLocation);
            console.log("Current location: ", currLocation);
        };
        getPermissions();
    }, []);

    const fetchData = async () => {
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch(`http://192.168.1.6:8000/api/friendsevents/${user.username}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            }
        });
        const data = await response.json();
        // console.log("data", data);
        // const filteredEvents = data.filter(event => followedUserIDs.includes(event.creation_user));
        setData(data);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const renderItem = ({ item }) => {
        return (
          <View style={styles.flatListContainer}>
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

    return (
        <View style={styles.title}>
            <Text style={styles.format}>Events by the people you follow!</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl = {
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => onRefresh()}
                    />
                }
                contentContainerStyle={{paddingTop: 10, paddingBottom: 100}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10, paddingLeft: 10, fontSize: 32
    },
    format: {
        padding: 7, fontSize: 20, fontWeight: 'bold', color: '#BD7979'
    },
    flatListContainer: {
        flex: 1, marginBottom: 10
    },
})

export default HomeScreen;