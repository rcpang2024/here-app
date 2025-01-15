import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useEffect } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";

const ContactUsScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
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
    });

    // PLACEHOLDER: REPLACE WITH THE EVENTUAL SUPPORT EMAIL
    const handleEmailPress = () => {
        // PLACEHOLDER
        const email = 'raypang02@gmail.com';
        const emailURL = `mailto:${email}`;

        Linking.openURL(emailURL).catch((e) => {
            alert("Failed to open email app: ", e);
        });
    };

    return (
        <View>
            <View style={styles.container}>
                <Text style={{paddingTop: 10, paddingBottom: 10, fontSize: 20}}>
                    Email us if you have any questions or technical issues and we will try to
                    resolve it as soon as possible.
                </Text>
                <Text style={{paddingBottom: 10, fontSize: 20}}>
                    Please include your username, email, and other necessary information to help us 
                    pinpoint the problem quicker.
                </Text>
                <Text style={{paddingBottom: 10, fontSize: 20}}>Thank you!</Text>
                <TouchableOpacity onPress={handleEmailPress}>
                    <Text style={styles.emailText}>raypang02@gmail.com</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignItems: 'center',
        borderColor: 'black',
        borderWidth: 3,
      },
    buttonText: {
        fontWeight: 'bold', fontSize: 16, marginLeft: 5,
    },
    title: {
        fontSize: 24, fontWeight: 'bold', marginTop: 10, alignSelf: 'center',
    },
    body: {
        fontSize: 18, color: 'black', marginTop: 5, padding: 10,
    },
    emailText: {
        fontSize: 18, color: 'blue', textDecorationLine: 'underline'
    }
})

export default ContactUsScreen;