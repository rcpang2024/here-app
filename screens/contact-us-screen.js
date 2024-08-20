import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";

const ContactUsScreen = () => {
    const navigation = useNavigation();
    const [msg, setMsg] = useState('');

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

    return (
        <View>
            <View style={styles.container}>
                <TextInput
                    // ref={pwRef}
                    placeholder="Type your message here"
                    style={styles.input}
                    returnKeyType="next"
                    secureTextEntry={true}
                    onChangeText={(val) => setMsg(val)}
                    value={msg}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => console.log("Send Email")}>
                <Text style={styles.buttonText}>SEND</Text>
            </TouchableOpacity>
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
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        alignSelf: 'center',
    },
    body: {
        fontSize: 18,
        color: 'black',
        marginTop: 5,
        padding: 10,
    },
    input: {
        fontSize: 20,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
})

export default ContactUsScreen;