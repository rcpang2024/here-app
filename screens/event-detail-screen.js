import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useContext } from "react";
import format from "date-fns/format";
import { UserContext } from "../user-context";
// import MapView, { Marker } from 'react-native-maps';

const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const event_id = route.params.eventID;
    const creation_user = route.params.creationUser;
    const event_name = route.params.eventName;
    const event_description = route.params.eventDescription;
    const location = route.params.theLocation;
    const date = route.params.theDate;
    const list_of_attendees = route.params.attendees

    const formattedDate = format(new Date(date), 'MM-dd-yyyy');
    const formattedTime = format(new Date(date), 'h:mm a');
    const { user } = useContext(UserContext);
    
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
    }, [route.params]);

    const fetchUserProfile = async (username) => {
        try {
            const response = await fetch(`http://192.168.1.142:8000/api/users/username/${username}/`);
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

    return (
        <View style={styles.title}>
            <Text style={{fontSize:26, ...padding(0, 0, 10, 0), fontWeight: 'bold'}}>{event_name}</Text>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Creation User</Text>
                <TouchableOpacity onPress={() => handleUserPress(creation_user)}>
                    <Text style={styles.infoText}>{creation_user}</Text>
                </TouchableOpacity>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Date</Text>
                <Text style={styles.infoText}>{formattedDate}</Text>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Time</Text>
                <Text style={styles.infoText}>{formattedTime}</Text>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Location</Text>
                <Text style={styles.infoText}>{location}</Text>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Description</Text>
                <Text style={{paddingBottom: 20, fontSize: 16}}>{event_description}</Text>
            </View>
            <View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                    navigation.navigate("Attendees", {
                        attendees: list_of_attendees,
                    })
                    }
                >
                    <Text style={styles.buttonText}>ATTENDEES</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function padding(a, b, c, d) {
    return {
      paddingTop: a,
      paddingRight: b !== undefined ? b : a,
      paddingBottom: c !== undefined ? c : a,
      paddingLeft: d !== undefined ? d : (b !== undefined ? b : a)
    }
}

const styles = StyleSheet.create({
    title: {
        ...padding(15, 10, 10, 10),
        fontSize:28, 
        padding: 2, 
        fontWeight: 'bold'
    },
    text: {
        ...padding(10, 10, 0, 0),
        fontSize: 16,
    },
    headers: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#BD7979',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: 'bold',
        fontSize: 16,
    },
    map: {
        width: '100%',
        height: '30%',
    },
    infoText: {
        fontSize: 18
    }
})

export default EventDetailScreen;