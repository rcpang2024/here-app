import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, TextInput, 
    Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useContext, useState, useRef } from "react";
import format from "date-fns/format";
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';

const EventDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

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
    const [comments, setComments] = useState(false);
    const [showReplies, setShowReplies] = useState({});
    const [msg, setMSG] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const inputRef = useRef(null);

    if (date) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
            formattedDate = format(parsedDate, 'MM-dd-yyyy');
            formattedTime = format(parsedDate, 'h:mm a');
        }
    }
    
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
        retrieveComments();
    }, [route.params]);

    const fetchUserProfile = async (username) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
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

    const retrieveComments = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/comments/${event_id}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (response.ok) {
                const commentData = await response.json();
                setComments(commentData);
            }
        } catch (e) {
            alert("Error retrieving comments, try again later: ", e);
        }
    };

    const postComment = async (parentID = null, mentionedUser = null) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/addcomment/${event_id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    author: user.id,
                    event: event_id,
                    message: msg,
                    parent: parentID ? parentID : null,
                    mentioned_user: mentionedUser || null
                })
            });
            if (response.ok) {
                const commentData = await response.json();
                console.log("commentData: ", commentData);
                // setComments(prevComments => [...prevComments, commentData]);
                setComments(prevComments => {
                    if (parentID) {
                        return prevComments.map(comment => 
                            comment.id === parentID
                                ? {...comment, replies: [...comment.replies, commentData]}
                                : comment
                        );
                    }
                })
                setMSG('');
            } else {
                console.error("Error posting comment:", response.status);
                const errorData = await response.json();
                console.error("Backend response:", errorData);
            }
        } catch (e) {
            alert("Error retrieving comments, try again later: ", e);
        }
    };

    const deleteComment = async (commentID) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/deletecomment/${commentID}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (response.ok) {
                console.log("Comment successfully deleted.")
                setComments(comments.filter(comment => comment.id !== commentID));
            }
        } catch (e) {
            alert("Error deleting, try again later: ", e);
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

    const toggleReplies = (commentID) => {
        setShowReplies((prev) => ({...prev, [commentID] : !prev[commentID]}))
    };

    const confirmDeleteComment = (commentID) => {
        Alert.alert(
            "Delete",
            "Are you sure you want to delete this comment?",
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: () => deleteComment(commentID)}]
        );
    };

    // set setReplyingTo(id) within Flatlist to the item.id that is first passed to renderCommentItem
    const renderCommentItem = ({ item, level = 0 }) => (
        <View style={level == 1 ? {paddingLeft: 20} : {}}>
            <View style={{flexDirection: 'row'}}>
                <Image 
                    source={item.author_profilepic ? {uri: creation_user.profile_pic} : FallbackPhoto}
                    style={styles.commentImage}
                />
                <View style={{paddingLeft: 5}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{fontWeight: 'bold'}}>{item.author_username}</Text>
                        <Text style={{fontSize: 9, paddingLeft: 5, paddingTop: 4}}>{item.formatted_timestamp}</Text>
                        </View>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={() => handleUserPress(item.mentioned_username)}>
                            <Text style={{color: 'blue', paddingRight: 5}}>@{item.mentioned_username ? item.mentioned_username : creation_user}</Text>
                        </TouchableOpacity>
                        <Text style={{color: item.parent ? '#bd7979' : 'black'}}>{item.message}</Text>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', padding: 5}}>
                <TouchableOpacity onPress={() => {
                    setReplyingTo(item.id); 
                    const mention = `@${item.author_username} `;
                    const currentMsg = msg.startsWith("@") ? msg.split(" ").slice(1).join(" ") : msg; // Remove existing mention if present
                    setMSG(`${currentMsg}`); // Set new mention without duplicating
                    inputRef.current.focus();
                }
                }>
                    <Text style={{fontSize: 12}}>Reply</Text>
                </TouchableOpacity>
                {item.author_username == user.username && (
                    <View>
                        <TouchableOpacity onPress={() => confirmDeleteComment(item.id)}>
                            <Text style={{fontSize: 12, color: 'red'}}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            {(item.replies.length > 0 && !item.parent) && (
                <View>
                    <TouchableOpacity onPress={() => toggleReplies(item.id)} style={{alignSelf: 'center'}}>
                        <Text style={{color: 'gray'}}>{showReplies[item.id] ? "Hide Replies" : "View Replies"}</Text>
                    </TouchableOpacity>
                </View>
            )}
            {(showReplies[item.id] || item.parent) && (
                <FlatList 
                    data={item.replies}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => renderCommentItem({ item: item, level: level + 1 })}
                />
            )}
        </View>
    );

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
                                keyExtractor={(item) => item.id}
                                renderItem={renderCommentItem}
                                contentContainerStyle={{ paddingTop: 5, paddingBottom: 5 }}
                            />
                            <View style={styles.commentInputContainer}>
                                <TextInput 
                                    ref={inputRef}
                                    placeholder={replyingTo ? "Reply to comment" : "Post a comment"}
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                    onChangeText={(val) => setMSG(val)}
                                    value={msg}
                                    style={styles.commentInput}
                                />
                                <TouchableOpacity onPress={() => {
                                    if (msg.trim() !== "") {  
                                        postComment(replyingTo, replyingTo ? comments.find(c => c.id === replyingTo)?.author : null);
                                        setReplyingTo(null); 
                                        setMSG("");
                                    }
                                }} style={styles.postButton}>
                                    <Text style={{justifyContent: 'center', alignSelf: 'center', color: 'white'}}>POST</Text>
                                </TouchableOpacity>
                            </View>
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
        paddingLeft: scale(10),
        fontSize: 26, 
        padding: 2, 
        fontWeight: 'bold'
    },
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(130, 129, 129, 0.1)", justifyContent: "flex-end"
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
        marginTop: verticalScale(5), width: scale(50), height: verticalScale(50), borderRadius: 50 / 2, overflow: "hidden", borderWidth: 2
    },
    commentImage: {
        marginTop: verticalScale(5), width: scale(35), height: verticalScale(35), borderRadius: 35 / 2, overflow: "hidden", borderWidth: 1
    },
    closeButton: {
        marginTop: 15, padding: 10, backgroundColor: "#1c2120", borderRadius: 5, alignItems: "center"
    },
    closeButtonText: {
        color: "white", fontWeight: "bold"
    },
    commentInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        backgroundColor: "#fff",
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
        backgroundColor: "#f5f5f5",
    },
    postButton: {
        backgroundColor: "#bd7979", padding: 10, borderRadius: 5, marginLeft: 10,
    },
    commentContainer: {
        paddingVertical: 10, 
    },
    replyContainer: {
        paddingLeft: 20,  
        borderLeftWidth: 2,
        borderLeftColor: '#ccc',
        marginLeft: 10,
        paddingVertical: 10,
    },
})

export default EventDetailScreen;