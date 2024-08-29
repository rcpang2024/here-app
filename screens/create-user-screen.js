import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
    TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState, useEffect } from "react";
import RadioForm from "react-native-simple-radio-button";
import HereLogo from '../assets/images/HereLogo.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const CreateUserScreen = () => {
    const navigation = useNavigation();
    const privacyItems = [
        {label: 'Public', value: 'public'},
        {label: 'Private', value: 'private'}
    ];
    const userTypes = [
        {label: 'Individual', value: 'individual'},
        {label: 'Organization', value: 'organization'}
    ];
    const auth = FIREBASE_AUTH;

    const [username, setUsername] = useState('');
    const [pw, setPW] = useState('');
    const [pwAgain, setPWAgain] = useState('');
    const [email, setEmail] = useState('');
    // const [phone, setPhone] = useState('');
    const [name, setName] = useState('');


    const [userType, setUserType] = useState('individual');
    const [userPrivacy, setUserPrivacy] = useState('public');

    const usernameRef = useRef();
    const pwRef = useRef();
    const pwAgainRef = useRef();
    const emailRef = useRef();
    // const phoneRef = useRef();
    const nameRef = useRef();

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
    }, []);

    const createUser = async () => {
        try {
            const response = await fetch('http://192.168.1.6:8000/api/createuser/', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    username: username,
                    password: pw,
                    name: name,
                    email: email,
                    // phone_number: phone,
                    bio: '',
                    list_of_followers: [],
                    list_of_following: [],
                    user_type: userType,
                    user_privacy: userPrivacy,
                    created_events: [],
                    attending_events: [],
                }),
            });
            console.log("Body: ", response.body);
            if (!response.ok) {
                // Handling error response from the server here
                const errorData = await response.json();
                console.error('Response from server:', errorData);
                throw new Error(errorData.detail || 'Unknown error');
            }
            const data = await response.json();
            return data; // Return the data from the API response
        } catch (error) {
            console.error('Error creating User:', error);
            throw error;
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const signUp = async () => {
        try {
            if (!username || !pw || !name || !email) {
                alert('Please fill out all fields before proceeding.');
            }
            const response = await createUserWithEmailAndPassword(auth, email, pw);
            if (!response) {
                alert("Error creating user");
            } else {
                await sendEmailVerification(response.user);
                alert("Email verification sent. Check your inbox.");
                const userData = await createUser();
                if (userData) {
                    dismissKeyboard();
                    navigation.navigate("Login");
                    // navigation.navigate("Confirm Email");
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // const handleClick = () => {
    //     // Verifies that all fields are filled out
    //     if (!username || !pw || !name || !email) {
    //         alert('Please fill out all fields before proceeding.');
    //         return;
    //     }
    //     if (pw != pwAgain) {
    //         alert('Passwords do not match');
    //         return;
    //     }
    //     fetchPost().then((data) => {
    //         console.log("Inside handleClick: ", data);
    //     })
    //     .catch((error) => {
    //         console.error('Error in Creating User:', error.message);
    //     })
    //     .finally(() => {
    //         dismissKeyboard();
    //         // PROBLEM - NOT SURE WHY THO
    //         // navigation.navigate("Confirm Email");
    //     });
    // };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <ScrollView style={styles.title}>
                <Image source={HereLogo} style={styles.logo} resizeMode="contain"/>
                <View style={styles.textFields}>
                    <TextInput
                        ref={usernameRef}
                        placeholder="Username"
                        style={styles.input}
                        returnKeyType="next"
                        onChangeText={(val) => setUsername(val)}
                    />
                </View>
                <View style={styles.textFields}>
                    <TextInput
                        ref={pwRef}
                        placeholder="Password"
                        style={styles.input}
                        returnKeyType="next"
                        secureTextEntry={true}
                        onChangeText={(val) => setPW(val)}
                    />
                </View>
                <View style={styles.textFields}>
                    <TextInput
                        ref={pwAgainRef}
                        placeholder="Retype Password"
                        style={styles.input}
                        returnKeyType="next"
                        onChangeText={(val) => setPWAgain(val)}
                    />
                </View>
                <View style={styles.textFields}>
                    <TextInput
                        ref={nameRef}
                        placeholder="Name"
                        style={styles.input}
                        returnKeyType="next"
                        onChangeText={(val) => setName(val)}
                    />
                </View>
                <View style={styles.textFields}>
                    <TextInput
                        ref={emailRef}
                        placeholder="Email"
                        style={styles.input}
                        returnKeyType="next"
                        onChangeText={(val) => setEmail(val)}
                    />
                </View>
                <Text style={{paddingVertical: 5}}>Account Privacy - you can change this later</Text>
                <RadioForm
                    radio_props={privacyItems}
                    initial={userPrivacy}
                    onPress={(val) => setUserPrivacy(val)}
                />
                {/* <Text style={{paddingVertical: 5}}>Account Type - you can change this later</Text>
                <RadioForm
                    radio_props={userTypes}
                    initial={userType}
                    onPress={(val) => setUserType(val)}
                /> */}
                <TouchableOpacity style={styles.createButton} onPress={signUp}>
                    <Text style={styles.createText}>Create Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    title: {
        alignContent: 'center',
        marginLeft: 12,
        marginRight: 12,
    },
    container: {
        flex: 1,
        paddingHorizontal: 15,
        // paddingTop: 20,
    },
    textFields: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 9,
        paddingHorizontal: 5,
    },
    input: {
        fontSize: 18,
        paddingVertical: 3,
        paddingHorizontal: 2,
    },
    logo: {
        width: '50%',
        height: '40%',
        alignSelf: 'center',
        marginTop: 10
    },
    createButton: {
        backgroundColor: '#1c2120',
        // backgroundColor: 'white',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        padding: 12,
        borderRadius: 5,
    },
    createText: {
        fontWeight: 'bold',
        color: 'white',
    },
    bottomPadding: {
        marginBottom: 25,
    }
})

export default CreateUserScreen;