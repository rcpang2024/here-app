import { StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, 
    Alert } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { FIREBASE_AUTH } from "../FirebaseConfig";
// import uuid from 'react-native-uuid';

const EditEventScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const auth = FIREBASE_AUTH;

    const event_id = route.params.eventID;
    const currEventName = route.params.eventName;
    const currDescription = route.params.eventDescription;
    const currLocation = route.params.theLocation;
    const currDate = route.params.theDate;
    // const currAttendees = route.params.attendees

    const [newEventName, setNewEventName] = useState(currEventName);
    const [newDescription, setNewDescription] = useState(currDescription);
    const [newLocation, setNewLocation] = useState(currLocation);

    const currDateObject = new Date(currDate);
    const [newDate, setNewDate] = useState(currDateObject);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const eventNameRef = useRef();
    const descriptionRef = useRef();
    const locationRef = useRef();
    const dateRef = useRef();

    const [mode, setMode] = useState('date');

    const formattedDate = format(currDateObject, 'MM/dd/yyyy');
    const formattedTime = format(currDateObject, 'hh:mm a');
    const [dateText, setDateText] = useState(formattedDate);
    const [timeText, setTimeText] = useState(formattedTime);
    const today = new Date();

    const onChange = (selectedDate) => {
        setShowDate(false);
        setShowTime(false);
        if (selectedDate) {
          setNewDate(selectedDate);
          let tempDate = new Date(selectedDate);
          let formattedDate = format(tempDate, 'MM/dd/yyyy');
          let formattedTime = format(tempDate, 'hh:mm a');
          setDateText(formattedDate);
          setTimeText(formattedTime);
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

    const updateEventInDB = async () => {
        const idToken = await auth.currentUser.getIdToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/updateevent/${event_id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    event_name: newEventName,
                    event_description: newDescription,
                    location: newLocation,
                    date: newDate
                }),
            });
            const eventData = await response.json();
            return eventData;
        } catch (err) {
            console.error("Error updating event: ", err);
        }
    };  

    const handleUpdate = () => {
        updateEventInDB()
            .then(() => {
                navigation.goBack();
            })
            .catch((error) => {
                console.error("Error in handleUpdate: ", error);
            });
    };

    const handleCancel = () => {
        Alert.alert(
            'Do you want to quit?',
            // body text
            'All changes will be lost.',
            [
                {text: 'Yes', onPress: () => navigation.goBack()},
                {text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel'},
            ],
            { cancelable: false }
        );
    }

    return (
        <View>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View>
                    <View style={styles.container}>
                        <TextInput
                            ref={eventNameRef}
                            placeholder="Event Name"
                            defaultValue={currEventName}
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setNewEventName(val)}
                        />
                    </View>
                    <View style={styles.container}>
                        <TextInput
                            ref={descriptionRef}
                            placeholder="Event Description"
                            defaultValue={currDescription}
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setNewDescription(val)}
                        />
                    </View>
                    <View style={styles.container}>
                        <TextInput
                            ref={locationRef}
                            placeholder="Location"
                            defaultValue={currLocation}
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setNewLocation(val)}
                        />
                    </View>
                    <View>
                        <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
                            <Text style={{fontSize: 18}}>Date: {dateText}</Text>
                        </TouchableOpacity>
                            {showDate && (
                            <DateTimePickerModal
                                isVisible={showDate}
                                mode="date"
                                date={newDate}
                                onConfirm={onChange}
                                onCancel={hidePicker}
                                minimumDate={today}
                            />
                            )}
                        <TouchableOpacity style={styles.dateInput} onPress={showTimePicker}>
                            <Text style={{fontSize: 18}}>Time: {timeText}</Text>
                        </TouchableOpacity>
                            {showTime && (
                            <DateTimePickerModal
                                isVisible={showTime}
                                mode="time"
                                date={newDate}
                                onConfirm={onChange}
                                onCancel={hidePicker}
                                minimumDate={today}
                            />
                            )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View>
                <TouchableOpacity style={styles.editEvent} onPress={handleUpdate}>
                    <Text style={{fontWeight: 'bold'}}>UPDATE EVENT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancel} onPress={handleCancel}>
                    <Text style={{fontWeight: 'bold', color: 'red'}}>CANCEL</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        marginLeft: 10,
        marginRight: 10
    },
    input: {
        fontSize: 18,
        paddingVertical: 3,
        paddingHorizontal: 2,
    },
    editEvent: {
        borderColor: 'black',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
    },
    cancel: {
        borderColor: 'red',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
    },
    dateInput: {
        marginBottom: 15,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 1,
        paddingHorizontal: 8,
        paddingVertical: 20,
    }
})

export default EditEventScreen;