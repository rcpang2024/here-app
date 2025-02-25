import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, 
    Modal, Keyboard, TouchableWithoutFeedback, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { SearchBar } from "react-native-elements";
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';

const PrivateMessageScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    const [conversations, setConversations] = useState([]);

    // Modal for the search modal
    const [searchModalVisible, setSearchModalVisible] = useState(null);

    // For users - taken from search-screen.js
    const [searchUser, setUserSearch] = useState('');
    const [results, setResults] = useState([]);
    const [userSearchCache, setUserSearchCache] = useState({});

    const searchBarRef = useRef(null);

    const fetchUserConversations = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/get_conversations/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
            });
    
            if (response.ok) {
                const conversationData = await response.json();
                setConversations(conversationData);
                // console.log("conversations[0]: ", conversations[0].participants.find(p => p !== user.username));
            } else {
                alert("Error getting conversation: ", response.status);
            }
        } catch (e) {
            alert("Failed to retrieve conversation: ", e)
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
                    name="search" 
                    size={28} 
                    onPress={() => setSearchModalVisible(true)}
                    style={{position: 'absolute', right: 15, paddingTop: 2}}
                />
            )
        });
        fetchUserConversations();
    }, [route.params]);

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

    const startConversation = async (receiverId) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        
        try {
            const response = await fetch("http://192.168.1.6:8000/api/start_conversation/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    user1_id: user.id,  // Logged-in user
                    user2_id: receiverId,  // User they want to chat with
                })
            });
    
            if (response.ok) {
                const conversation = await response.json();
                console.log("Conversation started:", conversation);
                
                setConversations((prevConversations => [conversation, ...prevConversations]));

                // Navigate to the chat screen with this conversation
                navigation.navigate("Chat Screen", { conversationId: conversation.id });
            } else {
                alert("Error starting conversation: ", response.status);
            }
        } catch (e) {
            alert("Failed to start conversation: ", e)
        }
    };

    const deleteConversation = async (conversationId) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/delete_conversation/${conversationId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
            });
    
            if (response.ok) {
                setConversations((prevConversations => prevConversations.filter(conv => conv.id !== conversationId)));
            } else {
                alert(`Error deleting conversation: ${response.status}`);
            }
        } catch (e) {
            alert(`Failed to delete conversation: ${e.message}`);
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

    const handleCloseSearchModal = () => {
        setSearchModalVisible(false);
        setUserSearch('');
        Keyboard.dismiss();
        searchBarRef.current?.blur();
    };

    const handleDeleteConversation = (conversationId) => {
        Alert.alert("Delete conversation?", "This action cannot be reversed.", [
            {text: "Cancel", onPress: () => {}, style: "cancel"},
            {text: "Delete", onPress: () => deleteConversation(conversationId)}
        ])
    };

    const renderUserItem = ({ item }) => {
        return (
            <View style={{paddingBottom: 5}}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity 
                        onPress={() => startConversation(item.id)} 
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
        <View>
            <FlatList 
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <View style={{padding: 5}}>
                        <TouchableOpacity onPress={() => navigation.navigate("Chat Screen", {conversationId: item.id})}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Image source={item.participants.find(p => p !== user.username)?.profile_pic 
                                    ? {uri: item.participants.find(p => p !== user.username)?.profile_pic} 
                                    : FallbackPhoto}  
                                    style={styles.image}
                                />
                                <Text style={{fontWeight: 'bold', fontSize: 16, marginLeft: 10}}>
                                    {item.participants.find(p => p !== user.username)}
                                </Text>
                            </View>
                            <Text style={{fontSize: 10, paddingLeft: 3}}>Last message at: {item.formatted_timestamp}</Text>
                        </TouchableOpacity>
                        <Ionicons 
                            name="trash" 
                            size={22} 
                            color="#bd7979"
                            onPress={() => handleDeleteConversation(item.id)}
                            style={{position: 'absolute', right: 5, marginTop: 5}}
                        />
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