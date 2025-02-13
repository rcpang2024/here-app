import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
    Keyboard, KeyboardAvoidingView, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState, useContext } from "react";
import { UserContext } from "../user-context";
import HereLogo from '../assets/images/HereLogo.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';
// import AsyncStorage from "@react-native-async-storage/async-storage";

const LogInScreen = () => {
    const navigation = useNavigation();
    const { setUser } = useContext(UserContext); // Access setUser from context

    // Sets the email and password to whatever the user typed in
    const [email, setEmail] = useState('');
    const [pw, setPW] = useState('');

    // Toggles whether password is shown or not on the screen
    const [showPW, setShowPW] = useState(false);

    const [loading, setLoading] = useState(false);

    const emailRef = useRef();
    const pwRef = useRef();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const fetchUser = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
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

    // TODO
    // Change to send token to the backend via HTTPS securely to verify user identity
    // Supabase login
    async function signInWithEmail() {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({email: email, password: pw});
        if (!data) {
            alert("Invalid login credentials, please try again");
            setLoading(false);
        } 
        if (error) {
            Alert.alert(error.message);
            setLoading(false);
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
        setLoading(false);
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
                <View style={styles.title}>
                    <Image source={HereLogo} style={styles.logo} resizeMode="contain"/>
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
                                    style={{alignSelf: 'center', paddingLeft: scale(10)}}
                                    onPress={() => setShowPW(!showPW)}
                                />
                            </View>
                            <TouchableOpacity style={styles.signIn} onPress={signInWithEmail}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="white"/>
                                ) : (
                                    <Text style={styles.signInText}>Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    <View>
                        <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
                            <Text style={styles.otherText} >Forgot your password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Create Account")}>
                            <Text style={styles.otherText} >Don't have an account? Get started Here!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    title: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1c2120',
        // height: verticalScale(650)
    },
    border: {
        borderWidth: 2, borderRadius: 2, paddingHorizontal: scale(20), paddingVertical: verticalScale(15), borderColor: 'gray'
    },
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 2,
        borderRadius: 5,
        marginVertical: verticalScale(5),
        paddingHorizontal: scale(5),
        width: scale(250),
        flexDirection: 'row'
    },
    logo: {
        width: scale(250), height: verticalScale(120)
    },
    input: {
        fontSize: 20, paddingVertical: 4, paddingHorizontal: 2, flex: 1
    },
    signIn: {
        backgroundColor: '#bd7979', 
        marginBottom: 10, 
        marginTop: 10, 
        alignItems: 'center', 
        padding: 10, 
        borderRadius: 5,
    },
    signInText: {
        fontWeight: 'bold', color: 'white'
    },
    otherText: {
        paddingTop: 15, alignSelf: 'center', color: 'white', paddingBottom: 2
    },
})

export default LogInScreen;