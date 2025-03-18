import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard,
        Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { UserContext } from "../user-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from "../lib/supabase";

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, updateUserContext } = useContext(UserContext); // Access updateUser from context

    const currName = route.params.name;
    const currUsername = route.params.username;
    const currBio = route.params.bio;
    const currEmail = route.params.email;

    const [newName, setNewName] = useState(currName);
    const [newUsername, setNewUsername] = useState(currUsername);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [newBio, setNewBio] = useState(currBio);

    const nameRef = useRef();
    const usernameRef = useRef();
    const bioRef = useRef();

    useEffect(() => {
        // Set the left header component
        navigation.setOptions({
            headerLeft: () => (
            <Ionicons
                name="arrow-back"
                size={28}
                color="black"
                onPress={handleCancel}
                style={{ marginLeft: 16 }}
            />
            ),
        });
    }, []);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const checkUsername = async (username) => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/checkusername?username=${username}`);
            const data = await response.json();
            console.log("data: ", data.is_taken);
            setUsernameTaken(data.is_taken);
        } catch (e) {
            console.error("Error checking username: ", e);
        }
    };

    const debouncedCheckUsername = useCallback(
        debounce((username) => checkUsername(username), 500),
        []
    );

    const updateUserInDB = async () => {
        const token = await getToken();
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/updateuser/${currUsername}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName,
                    username: newUsername,
                    bio: newBio,
                    email: currEmail,
                }),
            });
            const userData = await response.json();
            return userData;
        } catch (error) {
            console.error("Error updating user: ", error);
        }
    };

    const handleUpdate = async () => {
        if (usernameTaken) {
            print(usernameTaken);
            Alert.alert("Username already taken", "Please choose another.");
            return;
        }
        try {
            const updated = await updateUserInDB();
            updateUserContext(updated);
            navigation.goBack();
        } catch (e) {
            console.error("Error in handleUpdate: ", error);
        }
        // updateUserInDB().then((updatedUser) => {
        //     updateUserContext(updatedUser); // Update user data in context
        //     navigation.goBack();
        // }).catch((error) => {
        //     console.error("Error in handleUpdate: ", error);
        // });
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

    // Add photo picker
    return (
        <View>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={{marginLeft: 10, marginRight: 10}}>
                    <View style={styles.container}>
                        <TextInput
                            ref={nameRef}
                            placeholder="Name"
                            defaultValue={currName}
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setNewName(val)}
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.container}>
                        <TextInput
                            ref={usernameRef}
                            placeholder="Username"
                            defaultValue={currUsername}
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => {setNewUsername(val), debouncedCheckUsername(val)}}
                            autoCapitalize="none"
                        />
                    </View>
                    {usernameTaken && (
                        <View>
                            <Text style={{color: 'red', paddingHorizontal: 3}}>Username is already taken</Text>
                        </View>
                    )}
                    <View style={styles.container}>
                        <TextInput
                            ref={bioRef}
                            placeholder="Bio"
                            defaultValue={currBio}
                            style={styles.input}
                            returnKeyType="next"
                            multiline={true}
                            onChangeText={(val) => setNewBio(val)}
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View style={{flex: 3}}>
                <Text style={{marginLeft: 10, marginRight: 5, marginTop: 10}}>
                    *You might have to refresh your profile screen once you click update
                    to see your changes.
                </Text>
                <TouchableOpacity style={styles.editProfile} onPress={handleUpdate}>
                    <Text style={{fontWeight: 'bold'}}>UPDATE PROFILE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancel} onPress={handleCancel}>
                    <Text style={{fontWeight: 'bold', color: 'red'}}>CANCEL</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    editProfile: {
        borderColor: 'black',
        borderRadius: 2,
        borderWidth: 3,
        padding: 10,
        marginTop: 10,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        height: 45
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
        height: 45
    },
    container: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 5,
        marginVertical: 10,
        paddingHorizontal: 5
    },
    input: {
        fontSize: 18, paddingVertical: 3, paddingHorizontal: 2
    },
})

export default EditProfileScreen;