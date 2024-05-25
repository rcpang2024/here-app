import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, 
    Keyboard } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";
import HereLogo from '../assets/images/HereLogo.png';

const LogInScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [username, setUsername] = useState('');
    const [pw, setPW] = useState('');

    const usernameRef = useRef();
    const pwRef = useRef();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const fetchUser = async () => {
        try {
            const response = await fetch(`http://192.168.1.142:8000/api/users/username/${username}/`);
            if (!response.ok) {
                throw new Error('Network response for user data was not ok');
            }
            const userData = await response.json();
            return userData;
        }
        catch (error) {
            alert("Please type in a valid username and password")
            // console.error("Error fetching user, make sure the username is correct: ", error);
        }
    };

    const handleClick = () => {
        if (username == '' || pw == '') {
            alert('Please type in your username and password');
        } else {
            fetchUser().then((data) => {
                if (data.password != pw) {
                    alert('Invalid username or password');
                } else {
                    dismissKeyboard();
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
        marginVertical: 12,
        paddingHorizontal: 5,
    },
    logo: {
        width: '75%',
        height: '55%',
        marginTop: 25
    },
    input: {
        fontSize: 22,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    signIn: {
        backgroundColor: '#1c2120',
        marginBottom: 10,
        marginTop: 8,
        alignItems: 'center',
        padding: 12,
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