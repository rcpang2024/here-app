import React, { useRef, useState, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
  Keyboard, Modal, Alert, ScrollView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import uuid from 'react-native-uuid';
import { UserContext } from "../user-context";
import * as Location from 'expo-location';
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';
import { getToken } from "../secureStorage";

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
  const [selectedDate, setSelectedDate] = useState(null); // For the date
  const [selectedTime, setSelectedTime] = useState(null); // For the time
  const today = new Date();

  // const onChange = (selectedDate) => {
  //   setShowDate(false);
  //   setShowTime(false);
  //   if (selectedDate) {
  //     setDate(selectedDate);
  //     let tempDate = new Date(selectedDate);
  //     let formattedDate = format(tempDate, 'MM/dd/yyyy');
  //     let formattedTime = format(tempDate, 'hh:mm a');
  //     setDateText(formattedDate);
  //     setTimeText(formattedTime);
  //   }
  // };
  const onChange = (selectedValue) => {
    if (mode === 'date') {
      setShowDate(false);
      if (selectedValue) {
        setSelectedDate(selectedValue);
        const formattedDate = format(new Date(selectedValue), 'MM/dd/yyyy');
        setDateText(formattedDate);
      }
    } else if (mode === 'time') {
      setShowTime(false);
      if (selectedValue) {
        setSelectedTime(selectedValue);
        const formattedTime = format(new Date(selectedValue), 'hh:mm a');
        setTimeText(formattedTime);
      }
    }
  };

  const combinedDateTime = () => {
    if (selectedDate && selectedTime) {
      const datePart = format(new Date(selectedDate), 'yyyy-MM-dd');
      const timePart = format(new Date(selectedTime), 'HH:mm:ss');
      return new Date(`${datePart}T${timePart}`);
    }
    return new Date(); // Default to the current date-time if no selection
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
      const eventDateTime = combinedDateTime();
      const { latitude, longitude } = await geocode(eventLocation);
      // if (!auth.currentUser) {
      //   throw new Error("User is not authenticated.");
      // }
      const token = await getToken();
      const response = await fetch('http://192.168.1.6:8000/api/createevent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          id: uuid.v4(),
          creation_user: user.id, 
          event_name: eventName,
          event_description: eventDesc,
          location_addr: eventLocation,
          location_point: {latitude, longitude},
          date: eventDateTime,
          list_of_attendees: [], 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unknown error');
      }
      const theData = await response.json();
      // console.log("Event created:", theData);
      return theData;
    } catch (error) {
      console.log('Error creating event:', error);
      throw error;
    }
  };

  const createdEventsNumMaxedOut = () => {
    Alert.alert(
      "Error Creating Event",
      "Make sure you have less than 3 active events or try again later.",
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
      <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
        <Text style={{fontSize: 10}}>NOTE: You can have a maximum of 3 active events at a time.</Text>
        <View style={styles.textEntry}>
          <TextInput
            ref={eventNameRef}
            placeholder="Event Name"
            placeholderTextColor={"gray"}
            style={styles.input}
            returnKeyType="next"
            onChangeText={(val) => setEventName(val)}
          />
          <TextInput
            ref={eventDescriptionRef}
            placeholder="Event Description"
            placeholderTextColor={"gray"}
            style={styles.input}
            returnKeyType="next"
            onChangeText={(val) => setEventDesc(val)}
          />
          <TextInput
            ref={locationRef}
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={"gray"}
            returnKeyType="next"
            onChangeText={(val) => setEventLocation(val)}
          />
           <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
              <Text style={{color: 'gray', fontSize: 14}}>{dateText}</Text>
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
            <TouchableOpacity style={styles.dateInput} onPress={showTimePicker}>
              <Text style={{color: 'gray', fontSize: 14}}>{timeText}</Text>
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
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingHorizontal: scale(18), paddingTop: verticalScale(5)
  },
  placeholderText: {
    color: 'black'
  },
  textEntry: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 3,
    marginVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    marginLeft: scale(1),
    marginRight: scale(1)
  },
  input: {
    marginBottom: verticalScale(15),
    marginTop: verticalScale(15),
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 3,
    fontSize: 14,
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(5),
    color: 'black'
  },
  dateInput: {
    marginBottom: verticalScale(15),
    marginTop: verticalScale(15),
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 3,
    fontSize: 14,
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(10),
    color: 'black'
  },
  button: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
    marginTop: verticalScale(12),
    borderRadius: 5,
    alignItems: 'center',
    borderColor: '#BD7979',
    borderWidth: 3
  },
  buttonText: {
    fontWeight: 'bold', fontSize: 16, marginLeft: scale(5), color: '#BD7979'
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
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
});

export default CreateEventScreen;
