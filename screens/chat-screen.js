import { View, Text, StyleSheet, TextInput, RefreshControl, TouchableOpacity, 
    TouchableWithoutFeedback, Keyboard, Modal, FlatList, Image } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState, useContext, useRef, useCallback, useMemo } from "react";
import { UserContext } from "../user-context";
import { SearchBar } from "react-native-elements";
import { supabase } from "../lib/supabase";
import * as ImagePicker from 'expo-image-picker';

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    const { conversationId } = route.params;

    // Text input
    const [msg, setMSG] = useState('');

    // Messages in the chat
    const [messages, setMessages] = useState([]);

    // Modal for the search modal
    const [searchModalVisible, setSearchModalVisible] = useState(null);

    // For users - taken from search-screen.js
    const [searchUser, setUserSearch] = useState('');
    const [results, setResults] = useState([]);
    const [userSearchCache, setUserSearchCache] = useState({});

    const inputRef = useRef(null);
    const searchBarRef = useRef(null);
    const socketRef = useRef(null);

    const fetchMessages = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/get_messages/${conversationId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                alert("Error fetching messages in chat");
            }
            const retrievedMessages = await response.json();
            setMessages(retrievedMessages);
        } catch (err) {
            console.log("Error fetching user profile: ", err);
        }
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
            headerRight: () => (
                <Ionicons 
                    name="person-add" 
                    size={28} 
                    onPress={() => setSearchModalVisible(true)}
                    style={{position: 'absolute', right: 15, paddingTop: 2}}
                />
            )
        });
        fetchMessages();

        const socket = new WebSocket(`ws://192.168.1.6:8000/ws/chat/${conversationId}/`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log(`Connected to chat room ${conversationId}`);
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`Message from ${data.sender}: ${data.message}`);
            setMessages((prevMessages) => [...prevMessages, data]);
        }

        socket.onclose = () => {
            console.log("Websocket closed");
        };
        return () => {
            socket.close();
        };
    }, [conversationId]);

    const sendMessage = () => {
        if (msg.trim() === '') return;

        const messageData = {
            sender: user.username,
            message: msg
        };

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(messageData));
        } else {
            alert("Websocket is not open");
        }
        setMSG('');
    };

    const chooseMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!status) {
            alert("Permissions not granted for camera roll access");
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 1
        });

        if (!result) {
            const selectedMedia = result.assets[0]; // First selected media
            console.log("Selected media:", selectedMedia);

            // Send to chat (Modify this to integrate with your chat function)
            sendMediaToChat(selectedMedia.uri);
        }
    };

    // Function to handle sending media in chat
    const sendMediaToChat = (mediaUri) => {
        console.log("Sending media:", mediaUri);
        // Implement logic to upload the media and send it in the chat
    };

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

    const searchDatabase = async (query) => {
        if (userSearchCache[query]) {
            setResults(userSearchCache[query]);
            return;
        }
        try {
            // Placeholder 
            const response = await fetch(`http://192.168.1.6:8000/api/searchusers?query=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            setUserSearchCache((prevCache) => ({ ...prevCache, [query]: data }));
            setResults(data);
        } catch (error) {
            console.error("Error searching the database: ", error);
        }
    };

    const addUserToConversation = async (userID) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/add_to_conversation/${conversationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    user_id: userID,  // User to add
                })
            });
    
            if (response.ok) {
                const conversationData = await response.json();
                console.log("User added to the conversation: ", conversationData);
            } else {
                alert("Error getting conversation: ", response.status);
            }
        } catch (e) {
            alert("Failed to retrieve conversation: ", e)
        }
    };

    const handleUserSearchChange = useCallback((text) => {
        setUserSearch(text);
        if (text.length > 0) {
            searchDatabase(text);
        } else {
            setResults([]);
        }
    }, [userSearchCache]);

    const handleCloseSearchModal = () => {
        setSearchModalVisible(false);
        setUserSearch('');
        Keyboard.dismiss();
        searchBarRef.current?.blur();
    };

    const renderUserItem = ({ item }) => {
        return (
            <View style={{paddingBottom: 5}}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                        onPress={() => addUserToConversation(item.id)} 
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Image 
                            source={item.profile_pic ? { uri: item.profile_pic } : FallbackPhoto} 
                            style={styles.image} 
                        />
                        <View>
                            <Text style={styles.resultText}>{item.username}</Text>
                            <Text style={{fontSize: 12, marginLeft: 10}}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const SearchUserRoute = useMemo(() => () => (
        <View>
            {searchUser !== '' && results.length === 0 ? (
            <Text style={{fontSize: 20, padding: 5}}>No results found...</Text>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerStyle={{ paddingTop: 5, paddingBottom: 15 }}
                />
            )}
        </View>
    ), [results]);

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <FlatList
                        data={messages}
                        keyExtractor={(item, index) => index.toString()} 
                        // inverted
                        renderItem={({ item }) => (
                            <View style={[
                                styles.messageContainer, 
                                item.sender_username === user.username ? styles.sentMessage : styles.receivedMessage
                            ]}>
                                <Text style={styles.messageText}>{item.text}</Text>
                            </View>
                        )}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 90 }}
                    />
                    <View style={styles.commentInputContainer}>
                        <TextInput 
                            ref={inputRef}
                            placeholder="Type your message"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onChangeText={(val) => setMSG(val)}
                            value={msg}
                            style={styles.commentInput}
                        />
                        <Ionicons 
                            name="add" 
                            size={28} 
                            onPress={chooseMedia}
                            style={{marginLeft: 7, paddingTop: 2}}
                        />
                        <TouchableOpacity onPress={sendMessage} style={styles.postButton}>
                            <Text style={{justifyContent: 'center', alignSelf: 'center', color: 'white'}}>POST</Text>
                        </TouchableOpacity>
                    </View> 
                </View>
                {searchModalVisible && (
                    <Modal animationType="slide" visible={searchModalVisible} onRequestClose={handleCloseSearchModal} transparent={true}>
                        <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss(); searchBarRef.current?.blur();}}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContent}>
                                    <SearchBar
                                        placeholder="Search for friends"
                                        placeholderTextColor="gray"
                                        onChangeText={handleUserSearchChange}
                                        value={searchUser}
                                        inputStyle={styles.searchBarInput}
                                        style={styles.searchBarUser}
                                        clearIcon={{size: 28, borderRadius: 2, padding: 3}}
                                        clearButtonMode="while-editing"
                                        autoCapitalize="none"
                                    />
                                    <Ionicons 
                                        name="close-outline" 
                                        size={22} 
                                        color="#bd7979"
                                        onPress={handleCloseSearchModal}
                                        style={{position: 'absolute', right: 5}}
                                    />
                                    <SearchUserRoute/>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    image: {
        marginLeft: 8,
        marginTop: 5,
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        overflow: "hidden",
        borderWidth: 2,
    },
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(130, 129, 129, 0.1)", justifyContent: "flex-end"
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        height: "90%", 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    commentInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        backgroundColor: "#fff",
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 10,
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
    searchBarUser: {
        backgroundColor: '#f0f0f0', borderRadius: 1, padding: 2
    },
    searchBarInput: {
        fontSize: 16, color: 'black'
    },
    resultText: {
        fontSize: 18, paddingBottom: 5, marginLeft: 10, fontWeight: 'bold'
    },
    messageContainer: {
        maxWidth: '70%', // Prevents message from stretching too far
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
    },
    sentMessage: {
        alignSelf: 'flex-end',  // Right align for logged-in user
        backgroundColor: '#bd7979', // Custom color for sent messages
        marginRight: 10
    },
    receivedMessage: {
        alignSelf: 'flex-start',  // Left align for other users
        backgroundColor: '#f0f0f0', // Light grey for received messages
        marginLeft: 10
    },
    messageText: {
        color: 'white', // Ensure text is visible
    }
})

export default ChatScreen;