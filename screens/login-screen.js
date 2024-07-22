import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
    Keyboard } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState, useContext } from "react";
import { UserContext } from "../user-context";
import HereLogo from '../assets/images/HereLogo.png';
import AsyncStorage from "@react-native-async-storage/async-storage";

const LogInScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { setUser } = useContext(UserContext); // Access setUser from context

    // Sets the username and password to whatever the user typed in
    const [username, setUsername] = useState('');
    const [pw, setPW] = useState('');

    const usernameRef = useRef();
    const pwRef = useRef();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const fetchUser = async () => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/users/username/${username}/`);
            if (!response.ok) {
                throw new Error('Network response for user data was not ok');
            }
            const userData = await response.json();
            return userData;
        }
        catch (error) {
            alert("Please type in a valid username and password")
        }
    };

    // const handleClick = async () => {
    //     if (username == '' || pw == '') {
    //         alert('Please type in your username and password');
    //     } else {
    //         try {
    //             const tokenResponse = await fetch(`http://192.168.1.142:8000/api/token/`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({ username, password: pw }),
    //             });
    //             if (!tokenResponse.ok) {
    //                 throw new Error('Invalid username or password');
    //             }
    //             const tokenData = await tokenResponse.json();
    //             await AsyncStorage.setItem('access_token', tokenData.access);
    //             await AsyncStorage.setItem('refresh_token', tokenData.refresh);
    
    //             const userResponse = await fetch(`http://192.168.1.142:8000/api/users/username/${username}/`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Authorization': `Bearer ${tokenData.access}`,
    //                 },
    //             });
    //             if (!userResponse.ok) {
    //                 throw new Error('Failed to fetch user data');
    //             }
    //             const userData = await userResponse.json();
    //             setUser(userData);
    //             dismissKeyboard();
    //             navigation.navigate("Tab");
    //             setUsername(''); 
    //             setPW(''); 
    //         } catch (error) {
    //             alert(error.message);
    //         }
    //     }
    // };

    const handleClick = () => {
        if (username == '' || pw == '') {
            alert('Please type in your username and password');
        } else {
            fetchUser().then((data) => {
                if (data.password != pw) {
                    alert('Invalid username or password');
                } else {
                    dismissKeyboard();
                    setUser(data);
                    navigation.navigate("Tab");
                    setUsername(''); 
                    setPW(''); 
                }
            })
            .catch((error) => {
                console.error('Error Logging In:', error.message);
            })
        }
    };

    return (
        <View style={styles.title}>
            <Image source={HereLogo} style={styles.logo} resizeMode="contain"/>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View>
                    <View style={styles.container}>
                        <TextInput
                            ref={usernameRef}
                            placeholder="Username"
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setUsername(val)}
                            value={username}
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
                        />
                    </View>
                    <TouchableOpacity style={styles.signIn} onPress={handleClick}>
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
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 3,
        paddingHorizontal: 5,
    },
    logo: {
        width: '65%',
        height: '50%',
        marginTop: 25
    },
    input: {
        fontSize: 20,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    signIn: {
        backgroundColor: '#1c2120',
        marginBottom: 10,
        marginTop: 8,
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
    },
    signInText: {
        fontWeight: 'bold',
        color: 'white',
    },
    otherText: {
        paddingTop: 10,
        // color: 'white',
    },
})

export default LogInScreen;