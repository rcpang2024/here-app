import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity, StyleSheet, Text, View, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import format from "date-fns/format";
import { supabase } from "../lib/supabase";
import { getToken } from "../secureStorage";

const EventItem = ({ event_id, creation_user, creation_user_username, event_name, event_description, location_addr, date, list_of_attendees }) => {
  const navigation = useNavigation();
  const { user, updateUserContext } = useContext(UserContext);

  // Variable to set if user is going to the event
  const [isGoing, setIsGoing] = useState(false);

  // const formattedDate = format(new Date(date), 'MM-dd-yyyy');
  // const formattedTime = format(new Date(date), 'h:mm a');
  const formattedDate = date && !isNaN(new Date(date))
    ? format(new Date(date), 'MM-dd-yyyy')
    : "Invalid Date";

  const formattedTime = date && !isNaN(new Date(date))
    ? format(new Date(date), 'h:mm a')
    : "Invalid Time";

  // Saves the user's registration status for the event
  const saveRegistrationStatus = async (event_id, status) => {
    try {
      await AsyncStorage.setItem(`event_${event_id}_status`, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving registration status:', error);
    }
  };
  
  // Registers user to the event
  const handleRegister = async () => {
    const token = await getToken();
    try {
      const response = await fetch(`http://192.168.1.6:8000/api/registeruser/${event_id}/${user.username}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    const token = await getToken();
    try {
      const response = await fetch(`http://192.168.1.6:8000/api/unregisteruser/${event_id}/${user.username}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    loadRegistrationStatus();
  }, []);

// Delete event
const handleDelete = async () => {
  Alert.alert(
    "Delete Event",
    "Are you sure you want to delete this event?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: async () => {
          // const { data } = await supabase.auth.getSession();
          // const idToken = data?.session?.access_token;
          const token = await getToken();
          try {
            const response = await fetch(`http://192.168.1.6:8000/api/deleteevent/${event_id}/`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            });

            if (response.ok) {
              // Remove event from user context
              const updatedUser = {
                ...user,
                created_events: user.created_events.filter(id => id !== event_id),
                attending_events: user.attending_events.filter(id => id !== event_id),
              };
              updateUserContext(updatedUser);
            } else {
              console.error('Failed to delete the event');
            }
          } catch (err) {
            console.error('Error deleting this event: ', err);
          }
        }
      }
    ]
  );
};

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Event Details", {
      eventID: event_id,
      creationUser: creation_user_username,
      eventName: event_name,
      eventDescription: event_description,
      theLocation: location_addr,
      theDate: date,
      attendees: list_of_attendees
    })}>
      <Text style={{ fontSize: 24, padding: 2, fontWeight: 'bold' }}>{event_name}</Text>
      <Text>Created by: {creation_user_username}</Text>
      <Text>Location: {location_addr}</Text>
      <Text style={{fontWeight: 'bold', color: '#BD7979'}}>Date: {formattedDate}</Text>
      <Text style={{fontWeight: 'bold', color: '#BD7979'}}>Time: {formattedTime}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isGoing ? styles.alreadyRegistered : null]}
          onPress={isGoing ? handleUnregister : handleRegister}
        >
          {!isGoing && <Ionicons name="add" size={20} color="white" />}
          <Text style={styles.buttonText}>{isGoing ? 'GOING!' : 'REGISTER'}</Text>
        </TouchableOpacity>
        {user && user.id === creation_user && (
          <View>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("Edit Event", {
              eventID: event_id,
              eventName: event_name,
              eventDescription: event_description,
              theLocation: location_addr,
              theDate: date,
              attendees: list_of_attendees
            })}>
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.buttonText}>EDIT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.buttonText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10, borderWidth: 1, borderColor: 'c5c5c5', borderRadius: 10, marginBottom: 10, marginRight: 10
  },
  buttonContainer: {
    marginTop: 10
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#BFB3B3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: "#5ADAD8",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  alreadyRegistered: {
    flexDirection: 'row',
    backgroundColor: '#EC6C6C',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white', marginLeft: 5, fontWeight: 'bold'
  },
});

export default EventItem;
