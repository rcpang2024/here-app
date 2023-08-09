import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";

const AttendeesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const list_of_attendees = route.params.attendees;
    const [attendeesWithUsernames, setAttendeesWithUsernames] = useState([]);

    const fetchUsernamesForAttendees = async () => {
        try {
            const attendeesWithUsernames = await Promise.all(
                list_of_attendees.map(async (attendeeID) => {
                const response = await fetch(`http://192.168.1.142:8000/api/users/id/${attendeeID}/`);
                if (!response.ok) {
                    throw new Error('Network response for user data was not ok');
                }
                const userData = await response.json();
                return userData.username;
            })
        );
        setAttendeesWithUsernames(attendeesWithUsernames);
        } catch (error) {
            console.error('Error fetching usernames for attendees:', error);
        }
    };

    useEffect(() => {
        // Set the left header component
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
        fetchUsernamesForAttendees();
        }, []);

    return (
        <View style={styles.title}>
            <FlatList
                data={attendeesWithUsernames}
                keyExtractor={(item) => item}
                renderItem={({ item }) => <TouchableOpacity onPress={()=> console.log("Item: ", item)}>
                    <Text style={styles.text}>{item}</Text></TouchableOpacity>}
                refreshControl = {
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => console.log('Refreshing attendees list')}
                    />
                }
                contentContainerStyle={{paddingBottom: 100}}
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
    text: {
        ...padding(25, 0, 0, 10),
        fontSize: 20,
        color: 'darkblue',
        borderStyle: 'solid',
        borderRadius: 2,
        borderColor: 'black',
    }
})

export default AttendeesScreen;