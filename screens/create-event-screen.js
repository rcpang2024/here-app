import React, { useRef, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
  Keyboard, Modal, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import uuid from 'react-native-uuid';
import { UserContext } from "../user-context";
import * as Location from 'expo-location';

const CreateEventScreen = () => {
  const [eventName, setEventName] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [modalVisibility, setModalVisibility] = useState(false);

  // User context to update and retrieve current logged in user
  const { user, updateUserContext } = useContext(UserContext);

  const eventNameRef = useRef();
  const eventDescriptionRef = useRef();
  const locationRef = useRef();

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [dateText, setDateText] = useState('Choose a Date');
  const [timeText, setTimeText] = useState('Choose a Time');
  const today = new Date();

  const onChange = (selectedDate) => {
    setShowDate(false);
    setShowTime(false);
    if (selectedDate) {
      setDate(selectedDate);
      let tempDate = new Date(selectedDate);
      let formattedDate = format(tempDate, 'MM/dd/yyyy');
      let formattedTime = format(tempDate, 'hh:mm a');
      setDateText(formattedDate);
      setTimeText(formattedTime);
    }
  };

  const geocode = async (address) => {
    try {
      const geocodedLocation = await Location.geocodeAsync(address);
      if (geocodedLocation.length > 0) {
        const { latitude, longitude } = geocodedLocation[0];
        return { latitude, longitude };
      } else {
        Alert.alert('Address not found, please enter a more specifi address');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  };

  const showDatePicker = () => {
    setShowDate(true);
    setShowTime(false);
    setMode('date');
  };

  const showTimePicker = () => {
    setShowTime(true);
    setShowDate(false);
    setMode('time');
  };

  const hidePicker = () => {
    setShowDate(false);
    setShowTime(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const clearTextInputs = () => {
    eventNameRef.current.clear();
    eventDescriptionRef.current.clear();
    locationRef.current.clear();
    setEventName("");
    setEventDesc("");
    setEventLocation("");
    setDateText('Choose a Date');
    setTimeText('Choose a Time');
    setDate(new Date());
  };

  const fetchPost = async () => {
    try {
      const { latitude, longitude } = await geocode(eventLocation);
      const response = await fetch('http://192.168.1.6:8000/api/createevent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({
          id: uuid.v4(),
          creation_user: user.id, 
          event_name: eventName,
          event_description: eventDesc,
          location_addr: eventLocation,
          location_point: {latitude, longitude},
          date: date,
          list_of_attendees: [], 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unknown error');
      }
      const data = await response.json();
      console.log("Event created:", data);
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const createdEventsNumMaxedOut = () => {
    Alert.alert(
      "Maximum number of events reached.",
      "Delete an event or wait for an event to expire before creating a new one.",
      [{text: "OK", onPress: () => {}, style: 'cancel'}]
    )
  };

  const handlePostEvent = () => {
    fetchPost().then((data) => {
      console.log("Inside handlePostEvent: ", data.id);
      const updatedUser = {
        ...user,
        created_events: [...user.created_events, data.id]
      };
      updateUserContext(updatedUser);
      setModalVisibility(true);
    })
    .catch((error) => {
      createdEventsNumMaxedOut();
      console.log("error in handlePostEvent: ", error);
    })
    .finally(() => {
      dismissKeyboard();
      clearTextInputs();
    });
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.textEntry}>
          <TextInput
            ref={eventNameRef}
            placeholder="Event Name"
            placeholderTextColor={"black"}
            style={styles.input}
            returnKeyType="next"
            onChangeText={(val) => setEventName(val)}
          />
          <TextInput
            ref={eventDescriptionRef}
            placeholder="Event Description"
            placeholderTextColor={"black"}
            style={styles.input}
            returnKeyType="next"
            onChangeText={(val) => setEventDesc(val)}
          />
          <TextInput
            ref={locationRef}
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={"black"}
            returnKeyType="next"
            onChangeText={(val) => setEventLocation(val)}
          />
           <TouchableOpacity style={styles.input} onPress={showDatePicker}>
              <Text>{dateText}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePickerModal
                isVisible={showDate}
                mode="date"
                date={date}
                onConfirm={onChange}
                onCancel={hidePicker}
                minimumDate={today}
              />
            )}
            <TouchableOpacity style={styles.input} onPress={showTimePicker}>
              <Text>{timeText}</Text>
            </TouchableOpacity>
            {showTime && (
              <DateTimePickerModal
                isVisible={showTime}
                mode="time"
                date={date}
                onConfirm={onChange}
                onCancel={hidePicker}
              />
            )}
        </View>
        <View>
          <TouchableOpacity style={styles.button} onPress={handlePostEvent}>
            <Text style={styles.buttonText}>POST EVENT</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibility}
          onRequestClose={() => {
            setModalVisibility(!modalVisibility);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{fontSize: 20, paddingBottom: 15}}>Event Created Successfully!</Text>
              <TouchableOpacity
                onPress={() => setModalVisibility(!modalVisibility)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  placeholderText: {
    color: 'black'
  },
  textEntry: {
    backgroundColor: '#F3B0B0',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 1,
    marginRight: 1,
  },
  input: {
    marginBottom: 15,
    marginTop: 15,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 3,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 25,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  modalView: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    backgroundColor: '#E4DBDB',
    borderRadius: 5,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreateEventScreen;
