import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, Keyboard,
        Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../user-context";
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, updateUserContext } = useContext(UserContext); // Access updateUser from context

    // const currPic = route.params.pic;
    const currName = route.params.name;
    const currUsername = route.params.username;
    const currBio = route.params.bio;
    const currEmail = route.params.email;
    // const currPW = route.params.pw;

    // const [newPic, setNewPic] = useState(currPic);
    const [newName, setNewName] = useState(currName);
    const [newUsername, setNewUsername] = useState(currUsername);
    const [newBio, setNewBio] = useState(currBio);

    // const picRef = useRef();
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

    const updateUserInDB = async () => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/updateuser/${currUsername}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newName,
                    username: newUsername,
                    bio: newBio,
                    email: currEmail,
                    // password: currPW,
                }),
            });
            const userData = await response.json();
            return userData;
        } catch (error) {
            console.error("Error updating user: ", error);
        }
    };

    const handleUpdate = () => {
        updateUserInDB().then((updatedUser) => {
            updateUserContext(updatedUser); // Update user data in context
            navigation.goBack();
        }).catch((error) => {
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
                        />
                    </View>
                    <View style={styles.container}>
                        <TextInput
                            ref={usernameRef}
                            placeholder="Username"
                            defaultValue={currUsername}
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setNewUsername(val)}
                        />
                    </View>
                    <View style={styles.container}>
                        <TextInput
                            ref={bioRef}
                            placeholder="Bio"
                            defaultValue={currBio}
                            style={styles.input}
                            returnKeyType="next"
                            multiline={true}
                            onChangeText={(val) => setNewBio(val)}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <View style={{flex: 'row'}}>
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
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    input: {
        fontSize: 18,
        paddingVertical: 3,
        paddingHorizontal: 2,
    },
})

export default EditProfileScreen;