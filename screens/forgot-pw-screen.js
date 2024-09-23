import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, 
    Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotScreen = () => {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const emailRef = useRef();
    const auth = FIREBASE_AUTH;

    const changePW = () => {
        if (email === '') {
            Alert.alert("Please type in your email.")
        }
        sendPasswordResetEmail(auth, email)
        .then(() => {
            Alert.alert("Password reset email sent.");
            setEmail('');
        }).catch((e) => {
            Alert.alert("Error sending reset email: ", e);
        })
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.title}>
                <View style={styles.container}>
                        <TextInput
                            ref={emailRef}
                            placeholder="Enter your email"
                            style={styles.input}
                            returnKeyType="next"
                            onChangeText={(val) => setEmail(val)}
                            autoCapitalize="none"
                        />
                </View>
                <TouchableOpacity style={styles.signIn} onPress={changePW}>
                    <Text style={styles.signInText}>SUBMIT</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text>Back to sign in</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center', justifyContent: 'center', flex: 1
    },
    container: {
        borderWidth: 1, borderRadius: 5, marginVertical: 10, paddingHorizontal: 5
    },
    input: {
        fontSize: 24, paddingVertical: 3, paddingHorizontal: 2
    },
    signIn: {
        backgroundColor: '#1c2120',
        marginBottom: 10,
        marginTop: 8,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    signInText: {
        fontWeight: 'bold', color: 'white'
    },
})

export default ForgotScreen;