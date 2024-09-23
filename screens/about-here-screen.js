import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native";
import HereLogo from '../assets/images/HereLogo.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";

const AboutHereScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={styles.buttonContent}>
                    <Ionicons name="arrow-back" size={28}></Ionicons>
                </View>
            </TouchableOpacity>
            <Image source={HereLogo} style={styles.herePic}/>
            <Text style={styles.title}>About Here!</Text>
            <Text style={styles.body}>
                Here! is a social media app which aims to make setting up small events easier. We all know
                how difficult it is to plan a night out or even just going to grab dinner with friends.
                Your different friends are all in different groupchats and some may not even know each other,
                but with Here! it is different. Just create an Event and then let your friends register 
                themselves!
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 10,
    },
    buttonBorder: {
        borderColor: 'black', borderRadius: 2, borderWidth: 2, paddingVertical: 5, paddingHorizontal: 5, alignItems: 'center', marginRight: 250,
    },
    buttonContent: {
        flexDirection: 'row', alignItems: 'center',
    },
    herePic: {
        borderRadius: 50, width: 150, height: 150, marginBottom: 10, alignSelf: 'center', marginTop: 10,
    },
    title: {
        fontSize: 24, fontWeight: 'bold', marginTop: 10, alignSelf: 'center',
    },
    body: {
        fontSize: 18, color: 'black', marginTop: 5, padding: 10,
    },
})

export default AboutHereScreen;