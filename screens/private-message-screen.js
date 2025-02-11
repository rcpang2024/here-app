import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FallbackPhoto from '../assets/images/fallbackProfilePic.jpg';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";

const PrivateMessageScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useContext(UserContext);

    const [selectedItem, setSelectedItem] = useState(null);

    const placeholderData = [
        {id: 1, name: 'bob'},
        {id: 2, name: 'jane'},
        {id: 3, name: 'mary'}
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
        });
    }, [route.params]);

    const toggleModal = (item) => {
        setSelectedItem(item ? item.id : null); // Set to item's ID when opening, null when closing
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
                    </View>
                )}
            />
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
        height: "82%", 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    postButton: {
        backgroundColor: "#bd7979", padding: 10, borderRadius: 5, marginLeft: 10,
    },
})

export default PrivateMessageScreen;