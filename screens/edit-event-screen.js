import { StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, 
    Alert, KeyboardAvoidingView } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';
// import uuid from 'react-native-uuid';

const EditEventScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Current event parameters
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
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/updateevent/${event_id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    event_name: newEventName,
                    event_description: newDescription,
                    location: newLocation,
                    date: newDate
                }),
            });
            const eventData = await response.json();
            console.log("eventData: ", eventData);
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
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
                <Text style={{paddingLeft: scale(10), fontSize: 10}}>NOTE: You may need to refresh to view changes after submitting.</Text>
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
                <View>
                    <TouchableOpacity style={styles.editEvent} onPress={handleUpdate}>
                        <Text style={{fontWeight: 'bold'}}>UPDATE EVENT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancel} onPress={handleCancel}>
                        <Text style={{fontWeight: 'bold', color: 'red'}}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: verticalScale(10),
        paddingHorizontal: scale(5),
        paddingVertical: verticalScale(5),
        marginLeft: scale(10),
        marginRight: scale(10)
    },
    input: {
        fontSize: 18,
        paddingVertical: verticalScale(3),
        paddingHorizontal: scale(2),
    },
    editEvent: {
        borderColor: 'black',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: verticalScale(10),
        alignItems: 'center',
        marginLeft: scale(10),
        marginRight: scale(10),
    },
    cancel: {
        borderColor: 'red',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: verticalScale(10),
        alignItems: 'center',
        marginLeft: scale(10),
        marginRight: scale(10),
    },
    dateInput: {
        marginBottom: verticalScale(15),
        marginTop: verticalScale(10),
        marginLeft: scale(10),
        marginRight: scale(10),
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 1,
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(20),
    }
})

export default EditEventScreen;