import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import MapView, { Marker } from 'react-native-maps';

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

    return (
        <View style={styles.title}>
            <Text style={{fontSize:26, ...padding(0, 0, 10, 0), fontWeight: 'bold'}}>{event_name}</Text>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Creation User</Text>
                <Text>{creation_user}</Text>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Date</Text>
                <Text>{date}</Text>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Location</Text>
                <Text>{location}</Text>
            </View>
            <View style={{...padding(10, 0, 10, 0)}}>
                <Text style={styles.headers}>Description</Text>
                <Text style={{paddingBottom: 20}}>{event_description}</Text>
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
                    <Text style={styles.buttonText}>Attendees</Text>
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
        fontSize: 18,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: 'darkred',
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
})

export default EventDetailScreen;