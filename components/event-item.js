import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EventItem = ({ event_id, creation_user, event_name, event_description, location, date, list_of_attendees }) => {
  const navigation = useNavigation();
  const { user, updateUserContext } = useContext(UserContext);

  const [creator, setCreator] = useState('');
  const [isGoing, setIsGoing] = useState(false);

  const saveRegistrationStatus = async (event_id, status) => {
    try {
      await AsyncStorage.setItem(`event_${event_id}_status`, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving registration status:', error);
    }
  };
  

  const handleRegister = async () => {
    try {
      const response = await fetch(`http://192.168.1.142:8000/api/registeruser/${event_id}/${user.username}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsGoing(true);
        saveRegistrationStatus(event_id, true); // Save registration status
        updateUserContext({ ...user, attending_events: [...user.attending_events, event_id] });
      } else {
        console.error('Failed to register for the event');
      }
    } catch (error) {
      console.error('Error registering for the event:', error);
    }
  };

  const loadRegistrationStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(`event_${event_id}_status`);
      if (status !== null) {
        setIsGoing(JSON.parse(status));
      }
    } catch (error) {
      console.error('Error loading registration status:', error);
    }
  };

  const handleUnregister = async () => {
    try {
      const response = await fetch(`http://192.168.1.142:8000/api/unregisteruser/${event_id}/${user.username}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsGoing(false);
        saveRegistrationStatus(event_id, false); // Save registration status
        updateUserContext({ ...user, attending_events: user.attending_events.filter(id => id !== event_id) });
        // onUnregister(event_id)
      } else {
        console.error('Failed to unregister from the event');
      }
    } catch (error) {
      console.error('Error unregistering from the event:', error);
    }
  };
  
  useEffect(() => {
    fetchCreator();
    loadRegistrationStatus();
  }, []);

  const fetchCreator = async () => {
    try {
        const response = await fetch(`http://192.168.1.142:8000/api/users/id/${creation_user}/`);
        const data = await response.json();
    setCreator(data.username);
    } catch (error) {
        console.error('Error fetching creation user for attendees:', error);
    }
};

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Event Details", {
      eventID: event_id,
      creationUser: creator,
      eventName: event_name,
      eventDescription: event_description,
      theLocation: location,
      theDate: date,
      attendees: list_of_attendees
    })}>
      <Text style={{ fontSize: 24, padding: 2, fontWeight: 'bold' }}>{event_name}</Text>
      <Text>Created by: {creator}</Text>
      <Text>Location: {location}</Text>
      <Text>Date: {date}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isGoing ? styles.alreadyRegistered : null]}
          onPress={isGoing ? handleUnregister : handleRegister}
        >
          {!isGoing && <Ionicons name="add" size={20} color="white" />}
          <Text style={styles.buttonText}>{isGoing ? 'GOING!' : 'REGISTER'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'c5c5c5',
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#BFB3B3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyRegistered: {
    flexDirection: 'row',
    // backgroundColor: '#73CADF',
    backgroundColor: '#EC6C6C',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    // fontStyle: 'oblique',
    fontWeight: 'bold'
  },
});

export default EventItem;
