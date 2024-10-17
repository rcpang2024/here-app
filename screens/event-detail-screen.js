import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useContext } from "react";
import format from "date-fns/format";
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const auth = FIREBASE_AUTH;

    const event_id = route.params.eventID;
    const creation_user = route.params.creationUser;
    const event_name = route.params.eventName;
    const event_description = route.params.eventDescription;
    const location = route.params.theLocation;
    const date = route.params.theDate;
    const list_of_attendees = route.params.attendees

    let formattedDate = 'Date not available';
    let formattedTime = 'Time not available';

    if (date) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
            formattedDate = format(parsedDate, 'MM-dd-yyyy');
            formattedTime = format(parsedDate, 'h:mm a');
        }
    }
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
        const idToken = await auth.currentUser.getIdToken();
        try {
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

    return (
        <View style={styles.title}>
            <Text style={{fontSize:26, paddingBottom: 10, fontWeight: 'bold', color: '#BD7979'}}>{event_name}</Text>
            <View style={styles.details}>
                <Text style={styles.headers}>Creation User</Text>
                <TouchableOpacity onPress={() => handleUserPress(creation_user)}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Image 
                            source={creation_user.profile_pic ? {uri: creation_user.profile_pic} : FallbackPhoto}
                            style={styles.image}
                        />
                        <Text style={{fontSize: 18, marginLeft: 10}}>{creation_user}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.details}>
                <Text style={styles.headers}>Date</Text>
                <Text style={styles.infoText}>{formattedDate}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.headers}>Time</Text>
                <Text style={styles.infoText}>{formattedTime}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.headers}>Location</Text>
                <Text style={styles.infoText}>{location}</Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.headers}>Description</Text>
                <Text style={{paddingBottom: 20, fontSize: 16}}>{event_description}</Text>
            </View>
            <View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("Attendees", {attendees: list_of_attendees, idEvent: event_id})}
                >
                    <Text style={styles.buttonText}>ATTENDEES</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 15,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        fontSize:28, 
        padding: 2, 
        fontWeight: 'bold'
    },
    text: {
        paddingTop: 10, paddingRight: 10, fontSize: 16
    },
    headers: {
        fontWeight: 'bold', fontSize: 18
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
        color: 'white', marginLeft: 5, fontWeight: 'bold', fontSize: 16
    },
    map: {
        width: '100%', height: '30%'
    },
    infoText: {
        fontSize: 18
    },
    details: {
        paddingTop: 10, paddingBottom: 10
    },
    image: {
        marginTop: 5,
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        overflow: "hidden",
        borderWidth: 2,
    }
})

export default EventDetailScreen;