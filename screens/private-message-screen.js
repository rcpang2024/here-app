import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
    Modal, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { SearchBar } from "react-native-elements";
import { supabase } from "../lib/supabase";
import * as ImagePicker from 'expo-image-picker';

const PrivateMessageScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    // Modal for the conversations
    const [selectedItem, setSelectedItem] = useState(null);
    const [msg, setMSG] = useState('');

    // Modal for the search modal
    const [searchModalVisible, setSearchModalVisible] = useState(null);

    // For users - taken from search-screen.js
    const [searchUser, setUserSearch] = useState('');
    const [results, setResults] = useState([]);
    const [userSearchCache, setUserSearchCache] = useState({});

    const inputRef = useRef(null);
    const searchBarRef = useRef(null);

    const placeholderData = [
        {conversation_id: 0, id: 1, name: 'bob'},
        {conversation_id: 1, id: 2, name: 'jane'},
        {conversation_id: 2, id: 3, name: 'mary'}
    ];

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
    }, [route.params]);

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

    const fetchUserProfile = async (username) => {
        try {
            const { data } = await supabase.auth.getSession();
            const idToken = data?.session?.access_token;
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

    const handleUserSearchChange = useCallback((text) => {
        setUserSearch(text);
        if (text.length > 0) {
            searchDatabase(text);
        } else {
            setResults([]);
        }
    }, [userSearchCache]);

    const toggleModal = (item) => {
        setSelectedItem(item ? item.id : null); // Set to item's ID when opening, null when closing
        connectToWebSocket(item.conversation_id);
    };

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
                        onPress={() => handleUserPress(item.username)} 
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

    const connectToWebSocket = (conversation_id) => {
        const socket = new WebSocket(`ws://192.168.1.6:8000/ws/chat/${conversation_id}/`);
    
        socket.onopen = () => {
            console.log(`Connected to chat room ${conversation_id}`);
        };
    
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`Message from ${data.sender}: ${data.message}`);
        };
    
        socket.onclose = () => {
            console.log("WebSocket closed");
        };
    };

    return (
        <View>
            <FlatList 
                data={placeholderData}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <View style={{padding: 5}}>
                        <TouchableOpacity onPress={() => toggleModal(item)}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Image source={FallbackPhoto} style={styles.image}/>
                                <Text style={{fontWeight: 'bold', fontSize: 14, marginLeft: 10}}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{height: 1, backgroundColor: 'gray', marginTop: 5, opacity: 0.6}} />
                    </View>
                )}
            />
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
            {selectedItem && (
                <Modal animationType="slide" visible={!!selectedItem} onRequestClose={() => toggleModal(null)} transparent={true}> 
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={{paddingTop: 5}}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', justifyContent: 'center', alignSelf: 'center'}}>
                                    Chat with {placeholderData.find(i => i.id === selectedItem)?.name}
                                </Text>
                                <Ionicons 
                                    name="close-outline" 
                                    size={32} 
                                    onPress={() => toggleModal(null)}
                                    style={{position: 'absolute', right: 10, paddingTop: 2}}
                                />
                            </View>
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
                                <TouchableOpacity onPress={() => console.log("Message")} style={styles.postButton}>
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
    text: {
        fontWeight: 'bold', paddingBottom: 5, marginLeft: 8, marginTop: 15, fontSize: 20
    },
    name: {
        fontSize: 14, marginLeft: 8
    },
    image: {
        marginLeft: 8,
        marginTop: 5,
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
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
        flex: 1,
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 15
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
})

export default PrivateMessageScreen;