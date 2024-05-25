import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRef, useState } from "react";

const ForgotScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [email, setEmail] = useState('');
    const emailRef = useRef();

    return (
        <SafeAreaView style={styles.title}>
            <View style={styles.container}>
                <TextInput
                    ref={emailRef}
                    placeholder="Enter your Email"
                    style={styles.input}
                    returnKeyType="next"
                    onChangeText={(val) => setEmail(val)}
                />
            </View>
            <TouchableOpacity style={styles.signIn}>
                <Text style={styles.signInText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text>Back to Sign In</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center'
    },
    container: {
        backgroundColor: 'white',
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 10,
        paddingHorizontal: 5,
    },
    input: {
        fontSize: 18,
        paddingVertical: 3,
        paddingHorizontal: 2,
    },
    signIn: {
        backgroundColor: '#1c2120',
        // backgroundColor: 'white',
        marginBottom: 10,
        marginTop: 8,
        alignItems: 'center',
        padding: 12,
        borderRadius: 5,
    },
    signInText: {
        fontWeight: 'bold',
        color: 'white',
    },
})

export default ForgotScreen;