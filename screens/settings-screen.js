import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';


const SettingsScreen = () => {

    const navigation = useNavigation();
    const route = useRoute();

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

    return (
        <View style={styles.title}>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={() => console.log("Settings")}>
                    <Text style={styles.text}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Account Information")}>
                    <Text style={styles.text}>Account Information</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("Security")}>
                    <Text style={styles.text}>Security</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("About Here!")}>
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