import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from "react-native";
import HereLogo from '../assets/images/HereLogo.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { scale, verticalScale } from 'react-native-size-matters';

const AboutHereScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#1c2120'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={styles.buttonContent}>
                    <Ionicons name="arrow-back" size={28} color={"white"}></Ionicons>
                </View>
            </TouchableOpacity>
            <View style={styles.container}>
                <Image source={HereLogo} style={styles.herePic}/>
                <Text style={styles.title}>About Here!</Text>
                <Text style={styles.body}>
                    Here! is a social media app which aims to make setting up small events easier. We all know
                    how difficult it is to plan a night out or even just going to grab dinner with friends.
                    Your different friends are all in different groupchats and some may not even know each other.
                    With Here! it is different. Just create an Event and then let your friends register themselves!
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center', justifyContent: 'center'
    },
    buttonBorder: {
        borderColor: 'black', borderRadius: 2, borderWidth: 2, paddingVertical: verticalScale(5), paddingHorizontal: scale(5), alignItems: 'center', marginRight: scale(250),
    },
    buttonContent: {
        flexDirection: 'row', paddingLeft: scale(10), paddingTop: verticalScale(10)
    },
    herePic: {
        width: scale(250), height: verticalScale(120), marginBottom: verticalScale(10), alignSelf: 'center', marginTop: verticalScale(10),
    },
    title: {
        fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: verticalScale(10), alignSelf: 'center',
    },
    body: {
        fontSize: 18, color: 'white', marginTop: verticalScale(5), paddingLeft: scale(15), paddingRight: scale(15)
    },
})

export default AboutHereScreen;