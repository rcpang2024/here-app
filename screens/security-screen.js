import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { supabase } from "../lib/supabase";
import { sendPasswordResetEmail } from "firebase/auth";

const SecurityScreen = () => {
    const navigation = useNavigation();
    const auth = FIREBASE_AUTH;    
    const { user } = useContext(UserContext);

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

    const handleDeleteAccount = async () => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/deleteuser/${user.username}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
            });
            if (response.ok) {
                Alert.alert("Your account has been successfully deleted. We hope to see back soon!")
            }
        } catch (e) {
            console.log("Error in handleDeleteAccount: ", e);
            Alert.alert("Error deleting account, try again later.");
        }
    };

    // CHANGE TO SUPABASE CHANGE PW
    const changePW = () => {
        sendPasswordResetEmail(auth, auth.currentUser.email)
        .then(() => {
            Alert.alert("Password reset email sent.");
        }).catch((e) => {
            Alert.alert("Error sending password reset email: ", e);
        })
    }

    const confirmDeleteAccount = () => {
        Alert.alert(
            "Delete Account", 
            "Are you sure you want to delete your account? This action is permanent and can not be reversed.", 
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: handleDeleteAccount}]
        );
    };

    return (
        <View style={styles.title}>
            <TouchableOpacity style={styles.button} onPress={changePW}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.delete} onPress={confirmDeleteAccount}>
                <Text style={styles.buttonText}>Delete Account</Text>
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
    delete: {
        fontSize: 26, color: "red" 
    }
})

export default SecurityScreen;