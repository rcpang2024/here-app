import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
    TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState, useEffect, useCallback } from "react";
import RadioForm from "react-native-simple-radio-button";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';

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

const CreateUserScreen = () => {
    const navigation = useNavigation();
    const privacyItems = [
        {label: 'Public', value: 'public'},
        {label: 'Private', value: 'private'}
    ];
    // FUTURE USE WHEN THERE ARE MULTIPLE TYPES
    // const userTypes = [
    //     {label: 'Individual', value: 'individual'},
    //     {label: 'Organization', value: 'organization'}
    // ];

    const [username, setUsername] = useState('');
    const [usernameTaken, setUsernameTaken] = useState(false);
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

    const checkUsername = async (username) => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/checkusername?username=${username}`);
            const data = await response.json();
            console.log("data: ", data[0]);
            setUsernameTaken(data[0]);
        } catch (e) {
            console.error("Error checking username: ", e);
        }
    };

    const debouncedCheckUsername = useCallback(
        debounce((username) => checkUsername(username), 500),
        []
    );

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
                    // password: pw,
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

    // Supabase sign up
    async function signUpWithEmail() {
        if (!username || !pw || !name || !email) {
            alert('Please fill out all fields before proceeding.');
            return;
        }
        if (pw !== pwAgain) {
            alert('Passwords do not match.');
            return;
        }
        const {data: { user, session }, error} = await supabase.auth.signUp({email: email, password: pw});

        if (error) {
            alert(error.message);
            return;
        }
        
        if (!user) {
            alert('Sign-up failed. Please try again later.');
            return;
        } else {
            try {
                const userData = await createUser();
                if (userData) {
                    dismissKeyboard();
                    alert("Account created! Verify your email before logging in.");
                    navigation.navigate("Login");
                }
            } catch (e) {
                alert("Error creating user, try again later: ", e);
            }
            dismissKeyboard();
            alert("Account created! Verify your email before logging in.");
            navigation.navigate("Login");
        }
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ScrollView style={styles.title}>
                    <View style={styles.textFields}>
                        <TextInput
                            ref={usernameRef}
                            placeholder="Username"
                            style={styles.input}
                            returnKeyType="next"
                            autoCapitalize="none"
                            onChangeText={(val) => {setUsername(val), debouncedCheckUsername(val)}}
                        />
                    </View>
                    {usernameTaken && (
                        <View>
                            <Text style={{color: 'red', paddingHorizontal: 3}}>Username is already taken</Text>
                        </View>
                    )}
                    <View style={styles.textFields}>
                        <TextInput
                            ref={nameRef}
                            placeholder="Name"
                            style={styles.input}
                            returnKeyType="next"
                            autoCapitalize="none"
                            onChangeText={(val) => setName(val)}
                        />
                    </View>
                    <View style={styles.textFields}>
                        <TextInput
                            ref={emailRef}
                            placeholder="Email"
                            style={styles.input}
                            returnKeyType="next"
                            autoCapitalize="none"
                            onChangeText={(val) => setEmail(val)}
                        />
                    </View>
                    <View style={styles.textFields}>
                        <TextInput
                            ref={pwRef}
                            placeholder="Password"
                            style={styles.input}
                            returnKeyType="next"
                            autoCapitalize="none"
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
                            autoCapitalize="none"
                            secureTextEntry={true}
                            onChangeText={(val) => setPWAgain(val)}
                        />
                    </View>
                    <Text style={{paddingVertical: 5, fontSize: 15, alignSelf: 'center'}}>Account Privacy - you can change this later</Text>
                    <RadioForm
                        radio_props={privacyItems}
                        buttonColor={'#BD7979'}
                        selectedButtonColor={'#BD7979'}
                        labelStyle={{fontSize: 18}}
                        style={{flexDirection: 'row', justifyContent: 'space-around'}}
                        initial={userPrivacy}
                        onPress={(val) => setUserPrivacy(val)}
                    />
                    {/* <Text style={{paddingVertical: 5}}>Account Type - you can change this later</Text>
                    <RadioForm
                        radio_props={userTypes}
                        initial={userType}
                        onPress={(val) => setUserType(val)}
                    /> */}
                    <TouchableOpacity style={styles.createButton} onPress={signUpWithEmail}>
                        <Text style={styles.createText}>Create Account</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    title: {
        alignContent: 'center', marginLeft: scale(12), marginRight: scale(12), flex: 1
    },
    container: {
        flex: 1, paddingHorizontal: scale(15)
    },
    textFields: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 2,
        borderRadius: 4,
        marginVertical: verticalScale(12),
        paddingHorizontal: scale(5)
    },
    input: {
        fontSize: 18, paddingVertical: verticalScale(3), paddingHorizontal: scale(2)
    },
    logo: {
        width: '100%', height: '40%', alignSelf: 'center', marginTop: 10
    },
    createButton: {
        backgroundColor: '#bd7979',
        marginTop: 18,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        padding: 12,
        borderRadius: 5
    },
    createText: {
        fontWeight: 'bold', color: 'white'
    },
    bottomPadding: {
        marginBottom: 25
    }
})

export default CreateUserScreen;