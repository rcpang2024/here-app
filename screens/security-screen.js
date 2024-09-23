import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

const SecurityScreen = () => {
    const navigation = useNavigation();
    const auth = FIREBASE_AUTH;    

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

    const changePW = () => {
        sendPasswordResetEmail(auth, auth.currentUser.email)
        .then(() => {
            Alert.alert("Password reset email sent.");
        }).catch((e) => {
            Alert.alert("Error sending password reset email: ", e);
        })
    }

    return (
        <View style={styles.title}>
            <TouchableOpacity style={styles.button} onPress={changePW}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10, paddingLeft: 10, fontSize: 32
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 3,
        alignSelf: 'center'
    },
    buttonText: {
        fontWeight: 'bold', fontSize: 16, marginLeft: 5
    },
    text: {
        fontSize: 26, marginBottom: 25
    },
})

export default SecurityScreen;