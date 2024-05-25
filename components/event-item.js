import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const EventItem = ({ event_id, creation_user, event_name, event_description, location, date, list_of_attendees }) => {
  const navigation = useNavigation();

  const [creator, setCreator] = useState('');
  const [isGoing, setIsGoing] = useState(false);

  const handleRegister = () => {
    setIsGoing((prevState) => !prevState);
  };
  
  useEffect(() => {
    fetchCreator();
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
          onPress={() => {
            handleRegister()
          }}
        >
          {!isGoing && <Ionicons name="add" size={20} color="white" />}
          <Text style={styles.buttonText}>{isGoing ? 'Going!' : 'Register'}</Text>
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
    backgroundColor: 'darkred',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyRegistered: {
    flexDirection: 'row',
    backgroundColor: 'blue',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
});

export default EventItem;
