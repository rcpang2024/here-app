import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
    Keyboard, KeyboardAvoidingView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState, useContext } from "react";
import { UserContext } from "../user-context";
import HereLogo from '../assets/images/HereLogo.png';
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const LogInScreen = () => {
    const navigation = useNavigation();
    const { setUser } = useContext(UserContext); // Access setUser from context
    const auth = FIREBASE_AUTH;

    // Sets the email and password to whatever the user typed in
    const [email, setEmail] = useState('');
    const [pw, setPW] = useState('');

    const emailRef = useRef();
    const pwRef = useRef();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const fetchUser = async () => {
        const idToken = await auth.currentUser.getIdToken(true); // Get Firebase ID token
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

    return (
        <KeyboardAvoidingView>
            <View style={styles.title}>
                <Image source={HereLogo} style={styles.logo} resizeMode="contain"/>
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View>
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
                                secureTextEntry={true}
                                onChangeText={(val) => setPW(val)}
                                value={pw}
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity style={styles.signIn} onPress={signIn}>
                            <Text style={styles.signInText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                            <Text style={styles.otherText} >Forgot your username or password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Create Account")}>
                            <Text style={styles.otherText} >Don't have an account? Get started Here!</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center'
    },
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 5,
        paddingHorizontal: 5
    },
    logo: {
        width: '65%', height: '50%', marginTop: 35
    },
    input: {
        fontSize: 20, paddingVertical: 4, paddingHorizontal: 2
    },
    signIn: {
        backgroundColor: '#1c2120', marginBottom: 10, marginTop: 10, alignItems: 'center', padding: 10, borderRadius: 5
    },
    signInText: {
        fontWeight: 'bold', color: 'white'
    },
    otherText: {
        paddingTop: 15
    },
})

export default LogInScreen;