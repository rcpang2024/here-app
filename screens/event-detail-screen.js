import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useContext, useState } from "react";
import format from "date-fns/format";
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';

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

    let formattedDate = 'Date not available';
    let formattedTime = 'Time not available';

    const [modalVisible, setModalVisible] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const comments = ["Comment 1", "Comment 2", "Comment 3"];

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
        const { theData } = await supabase.auth.getSession();
        const idToken = theData?.session.access_token;
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

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const toggleComments = () => {
        setShowComments(!showComments); 
    };

    return (
        <View style={styles.title}>
            <Text style={{fontSize:26, paddingBottom: 10, fontWeight: 'bold', color: '#BD7979'}}>{event_name}</Text>
            <View style={styles.details}>
                <Text style={styles.headers}>Created by:</Text>
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
            <View>
                <TouchableOpacity style={styles.commentButton} onPress={toggleModal}>
                    <Text style={styles.commentText}>COMMENTS</Text>
                </TouchableOpacity>
            </View>
            {modalVisible && (
                <Modal animationType="slide" visible={modalVisible} onRequestClose={toggleModal} transparent={true}> 
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={{paddingTop: 5}}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', justifyContent: 'center', alignSelf: 'center'}}>
                                    Comments
                                </Text>
                                <Ionicons 
                                    name="close-outline" 
                                    size={32} 
                                    onPress={toggleModal}
                                    style={{position: 'absolute', right: 10, paddingTop: 2}}
                                />
                            </View>
                            <FlatList 
                                data={comments}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item}) => {
                                    return (
                                        <View>
                                            <Text style={{paddingTop: 15, paddingLeft: 5}}>{item}</Text>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: verticalScale(5),
        paddingRight: scale(10),
        // paddingBottom: 8,
        paddingLeft: scale(10),
        fontSize: 26, 
        padding: 2, 
        fontWeight: 'bold'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(130, 129, 129, 0.1)", // Semi-transparent background
        justifyContent: "flex-end", // Align content at the bottom
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        height: "82%", 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        paddingTop: verticalScale(10), paddingRight: scale(10), fontSize: 16
    },
    headers: {
        fontWeight: 'bold', fontSize: 18
    },
    button: {
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(7),
        paddingHorizontal: scale(10),
        borderRadius: 5,
        alignItems: 'center',
        borderColor: '#BD7979',
        borderWidth: 3
    },
    commentButton: {
        paddingVertical: verticalScale(5),
        paddingHorizontal: scale(10),
        borderRadius: 5,
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 3
    },
    buttonText: {
        fontWeight: 'bold', fontSize: 16, marginLeft: scale(5), color: '#BD7979'
    },
    commentText: {
        fontWeight: 'bold', fontSize: 16, marginLeft: scale(5), color: 'black'
    },
    map: {
        width: '100%', height: '30%'
    },
    infoText: {
        fontSize: 18
    },
    details: {
        paddingTop: verticalScale(10), paddingBottom: verticalScale(10)
    },
    image: {
        marginTop: verticalScale(5),
        width: scale(50),
        height: verticalScale(50),
        borderRadius: 50 / 2,
        overflow: "hidden",
        borderWidth: 2,
    },
    closeButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: "#1c2120",
        borderRadius: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: "white",
        fontWeight: "bold",
    },
})

export default EventDetailScreen;