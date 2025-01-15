import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
    Keyboard, KeyboardAvoidingView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState, useContext } from "react";
import { UserContext } from "../user-context";
import HereLogo from '../assets/images/HereLogo.png';
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from "../lib/supabase";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const LogInScreen = () => {
    const navigation = useNavigation();
    const { setUser } = useContext(UserContext); // Access setUser from context
    const auth = FIREBASE_AUTH;

    // Sets the email and password to whatever the user typed in
    const [email, setEmail] = useState('');
    const [pw, setPW] = useState('');

    // Toggles whether password is shown or not on the screen
    const [showPW, setShowPW] = useState(false);

    const emailRef = useRef();
    const pwRef = useRef();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const getAuthToken = async () => {
        const { data, error } = await supabase.auth.getSession();
        // console.log("data - getAuthToken: ", data);
        if (error) {
            console.error('Error retrieving session:', error);
            return null;
        }
        return data?.session?.access_token || null;
    };

    const fetchUser = async () => {
        // const idToken = await auth.currentUser.getIdToken(true); // Get Firebase ID token
        const idToken = await getAuthToken();
        // console.log("idToken: ", idToken);
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/email/${email}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response for user data was not ok');
            }
            const userData = await response.json();
            return userData;
        }
        catch (error) {
            alert("Please type in a valid username and password: ");
            console.log("Error in fetchUser: ", error);
        }
    }; 

    // Response features the Firebase login info such as uid and token
    // TODO
    // Send token to the backend via HTTPS securely to verify user identity
    const signIn = async () => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, pw);
            if (!response) {
                alert("Invalid login credentials, please try again");
            } 
            if (!response.user.emailVerified) {
                await sendEmailVerification(response.user);
                alert("Email Sent", "Verify your email first before logging in.");
            } else {
                // await sendTokenToBackend();
                const userData = await fetchUser();
                if (userData) {
                    setUser(userData);
                    dismissKeyboard();
                    navigation.navigate("Tab");
                    setEmail('');
                    setPW('');
                }
            }
        } catch (e) {
            console.error("Error signing in: ", e);
        }
    };

    // Supabase login
    async function signInWithEmail() {
        const { data, error } = await supabase.auth.signInWithPassword({email: email, password: pw});
        if (!data) {
            alert("Invalid login credentials, please try again");
        } 
        if (error) {
            Alert.alert(error.message);
        } else {
            const userData = await fetchUser();
            if (userData) {
                console.log("In signInWithEmail");
                setUser(userData);
                dismissKeyboard();
                navigation.navigate("Tab");
                setEmail('');
                setPW('');
            }
        }
    };

    return (
        <KeyboardAvoidingView>
            <View style={styles.title}>
                <Image source={HereLogo} style={styles.logo} resizeMode="contain"/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={styles.border}>
                        <View style={styles.container}>
                            <TextInput
                                ref={emailRef}
                                placeholder="Email"
                                style={styles.input}
                                returnKeyType="next"
                                onChangeText={(val) => setEmail(val)}
                                value={email}
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.container}>
                            <TextInput
                                ref={pwRef}
                                placeholder="Password"
                                style={styles.input}
                                returnKeyType="next"
                                secureTextEntry={!showPW}
                                onChangeText={(val) => setPW(val)}
                                value={pw}
                                autoCapitalize="none"
                            />
                            <Ionicons 
                                name="eye"
                                size={24}
                                color="#BD7979"
                                style={{alignSelf: 'center', paddingLeft: 10}}
                                onPress={() => setShowPW(!showPW)}
                            />
                        </View>
                        <TouchableOpacity style={styles.signIn} onPress={signInWithEmail}>
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
                <View>
                    <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                        <Text style={styles.otherText} >Forgot your username or password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Create Account")}>
                        <Text style={styles.otherText} >Don't have an account? Get started Here!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center'
    },
    border: {
        borderWidth: 2, borderRadius: 2, paddingHorizontal: 20, paddingVertical: 15, borderColor: 'gray'
    },
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 2,
        borderRadius: 5,
        marginVertical: 5,
        paddingHorizontal: 5,
        width: 250,
        flexDirection: 'row'
    },
    logo: {
        width: '100%', height: '50%'
    },
    input: {
        fontSize: 20, paddingVertical: 4, paddingHorizontal: 2, flex: 1
    },
    signIn: {
        backgroundColor: '#1c2120', marginBottom: 10, marginTop: 10, alignItems: 'center', padding: 10, borderRadius: 5
    },
    signInText: {
        fontWeight: 'bold', color: '#BD7979'
    },
    otherText: {
        paddingTop: 15, alignSelf: 'center'
    },
})

export default LogInScreen;