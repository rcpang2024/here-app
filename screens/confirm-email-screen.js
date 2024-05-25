import { View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";


const ConfirmEmailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const numberRef = useRef();
    const [number, setNumber] = useState('');

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <View style={styles.title}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View>
                    <TextInput
                        ref={numberRef}
                        placeholder="Enter confirmation code"
                        style={styles.input}
                        returnKeyType="next"
                        onChangeText={(val) => setNumber(val)}
                    />
                </View>
                <TouchableOpacity style={styles.confirm} onPress={() => console.log("PLACEHOLDER")}>
                    <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirm}>
                    <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
                <Pressable onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.resendText}>Back to Sign In</Text>
                </Pressable>
            </TouchableWithoutFeedback>
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
    input: {
        fontSize: 18,
        paddingVertical: 3,
        paddingHorizontal: 2,
    },
    confirm: {
        backgroundColor: '#1c2120',
        // backgroundColor: 'white',
        marginBottom: 10,
        marginTop: 8,
        alignItems: 'center',
        padding: 12,
        borderRadius: 5,
    },
    confirmText: {
        fontWeight: 'bold',
        color: 'white',
    },
    resend: {
        backgroundColor: 'white',
    },
    resendText: {
        fontWeight: 'bold',
        color: 'black',
    }
})

export default ConfirmEmailScreen;