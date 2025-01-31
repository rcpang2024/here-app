import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, 
    TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRef, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { scale, verticalScale } from 'react-native-size-matters';

const ForgotScreen = () => {
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const emailRef = useRef();

    // const changePW = () => {
    //     if (email === '') {
    //         Alert.alert("Please type in your email.")
    //     }
    //     sendPasswordResetEmail(auth, email)
    //     .then(() => {
    //         Alert.alert("Password reset email sent.");
    //         setEmail('');
    //     }).catch((e) => {
    //         Alert.alert("Error sending reset email: ", e);
    //     })
    // };

    // TEST THIS LATER
    const changePWSupabase = () => {
        if (email === '') alert("Please type in your email.");
        const { data, error } = supabase.auth.resetPasswordForEmail(email)
        .then(() => {
            alert("Password reset email sent.");
            setEmail('');
        }).catch((e) => {
            alert("Error sending reset email, try again later: ", e);
        })
    };

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event == "PASSWORD_RECOVERY") {
            const newPassword = prompt("What would you like your new password to be?");
            const { data, error } = await supabase.auth
              .updateUser({ password: newPassword })
     
            if (data) alert("Password updated successfully!")
            if (error) alert("There was an error updating your password.")
          }
        })
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.title}>
                <Text style={{fontSize: 14, paddingLeft: 10, alignContent:'center'}}>
                    Enter your email to receive a link to reset your 
                </Text>
                <Text style={{fontSize: 14, paddingLeft: 10, alignContent:'center'}}>password.</Text>
                <Text style={{fontSize: 12, padding: 10, alignSelf: 'center'}}>
                    If you have any issues, reach out to customer service.
                </Text>
                <View style={styles.container}>
                    <TextInput
                        ref={emailRef}
                        placeholder="Email"
                        style={styles.input}
                        returnKeyType="next"
                        onChangeText={(val) => setEmail(val)}
                        autoCapitalize="none"
                        multiline={false}
                    />
                </View>
                <TouchableOpacity style={styles.signIn} onPress={changePWSupabase}>
                    <Text style={styles.signInText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text>Back to sign in</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    title: {
        alignItems: 'center', justifyContent: 'center', flex: 1
    },
    container: {
        borderWidth: 1, 
        borderRadius: 5, 
        marginVertical: verticalScale(10), 
        paddingHorizontal: scale(5),
        width: 300
    },
    input: {
        fontSize: 24, paddingVertical: 3, paddingHorizontal: 2
    },
    signIn: {
        backgroundColor: '#bd7979',
        marginBottom: 10,
        marginTop: 8,
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    signInText: {
        fontWeight: 'bold', color: 'white'
    },
})

export default ForgotScreen;