import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState, useContext } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import RadioForm from "react-native-simple-radio-button";
import { UserContext } from "../user-context";
import { supabase } from "../lib/supabase";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user, updateUserContext } = useContext(UserContext);
    const [userPrivacy, setUserPrivacy] = useState(null);

    useEffect(() => {
        if (!user) {
            navigation.navigate('Login');  // Navigate to login if no user is signed in
            return;
        }
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
    }, [user, route.params, navigation]);

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>No user signed in</Text>
            </View>
        );
    }

    const privacyItems = [
        {label: 'Public', value: 'public'},
        {label: 'Private', value: 'private'}
    ];

    const initialPrivacyIndex = privacyItems.findIndex(item => item.value === user.user_privacy);

    const updateUserInDB = async (newPrivacy) => {
        const { data } = await supabase.auth.getSession();
        const idToken = data?.session?.access_token;
        try {
            const response = await fetch(`http://192.168.1.6:8000/api/updateuser/${user.username}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
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

    const supabaseLogOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert("Error signing out: ", error);
        }
        updateUserContext(null);
        navigation.navigate('Login');
    };

    const confirmLogOut = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [{text: "No", onPress: () => {}, style: "cancel"}, {text: "Yes", onPress: supabaseLogOut}],
        );
    };

    return (
        <View style={styles.title}>
            <View style={styles.buttons}>
                <Text style={{fontSize: 26, marginBottom: 8}}>Account Privacy</Text>
                <RadioForm
                    radio_props={privacyItems}
                    initial={initialPrivacyIndex}
                    buttonColor={'#BD7979'}
                    selectedButtonColor={'#BD7979'}
                    labelStyle={{fontSize: 18}}
                    onPress={(val) => {setUserPrivacy(val); updateUserInDB(val)}}
                    style={{marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', marginRight: 125}}
                />
                <TouchableOpacity onPress={() => navigation.navigate("Security")}>
                    <Text style={styles.text}>Settings & Security</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Blocked Users")}>
                    <Text style={styles.text}>Blocked Users</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("About Here")}>
                    <Text style={styles.text}>About Here!</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Contact Us")}>
                    <Text style={styles.text}>Contact Us</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmLogOut}>
                    <Text style={styles.logOut}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        paddingTop: 10, paddingLeft: 10, fontSize: 32
    },
    buttons: {
        paddingTop: 10, paddingLeft: 10, fontSize: 32, marginBottom: 5
    },
    text: {
        fontSize: 26, marginBottom: 25
    },
    logOut: {
        fontSize: 26, color: "red" 
    },
})

export default SettingsScreen;