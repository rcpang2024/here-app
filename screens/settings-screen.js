import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import RadioForm from "react-native-simple-radio-button";
import { UserContext } from "../user-context";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, updateUserContext } = useContext(UserContext);
    const [userPrivacy, setUserPrivacy] = useState(null);

    const privacyItems = [
        {label: 'Public', value: 'public'},
        {label: 'Private', value: 'private'}
    ];

    const initialPrivacyIndex = privacyItems.findIndex(item => item.value === user.user_privacy);

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
    }, [route.params]);

    const updateUserInDB = async (newPrivacy) => {
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/updateuser/${user.username}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_privacy: newPrivacy
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const userData = await response.json();
            // Update the context with the new user data
            updateUserContext(prevState => ({
                ...prevState,
                user_privacy: newPrivacy,
            }));
            return userData;
        } catch (error) {
            console.error("Error updating user: ", error);
        }
    };

    return (
        <View style={styles.title}>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => console.log("Settings")}>
                    <Text style={styles.text}>Settings</Text>
                </TouchableOpacity>
                <Text style={{fontSize: 26, marginBottom: 8}}>Account Privacy</Text>
                <RadioForm
                    radio_props={privacyItems}
                    initial={initialPrivacyIndex}
                    onPress={(val) => {setUserPrivacy(val); updateUserInDB(val)}}
                    style={{marginBottom: 15}}
                />
                <TouchableOpacity onPress={() => console.log("Account Information")}>
                    <Text style={styles.text}>Account Information</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Security")}>
                    <Text style={styles.text}>Security</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("About Here")}>
                    <Text style={styles.text}>About Here!</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Contact Us")}>
                    <Text style={styles.text}>Contact Us</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.logOut}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function padding(a, b, c, d) {
    return {
      paddingTop: a,
      paddingBottom: c !== undefined ? c : a,
      paddingRight: b !== undefined ? b : a,
      paddingLeft: d !== undefined ? d : (b !== undefined ? b : a)
    }
}

const styles = StyleSheet.create({
    title: {
        ...padding(10, 0, 0, 10),
        fontSize: 32
    },
    buttons: {
        ...padding(10, 0, 0, 10),
        fontSize: 32,
        marginBottom: 5,
    },
    text: {
        fontSize: 26,
        marginBottom: 25,
    },
    logOut: {
        fontSize: 26,
        color: "red",
    },
})

export default SettingsScreen;