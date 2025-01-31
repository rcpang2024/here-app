import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";

const SecurityScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(UserContext);

    // TEST THIS LATER
    const changePWSupabase = () => {
        const { data, error } = supabase.auth.resetPasswordForEmail(user.email)
        .then(() => {
            alert("Password reset email sent.");
            setEmail('');
        }).catch((e) => {
            alert("Error sending reset email, try again later: ", e);
        })
    };

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
                alert("Your account has been successfully deleted. We hope to see back soon!");
            }
        } catch (e) {
            console.log("Error in handleDeleteAccount: ", e);
            alert("Error deleting account, try again later.");
        }
        // const supabaseDelete = supabase.auth.admin.deleteUser();
    };

    const confirmDeleteAccount = () => {
        Alert.alert(
            "Delete Account", 
            "Are you sure you want to delete your account? This action is permanent and can not be reversed.", 
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: handleDeleteAccount}]
        );
    };

    return (
        <View style={styles.title}>
            <TouchableOpacity style={styles.button} onPress={changePWSupabase}>
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