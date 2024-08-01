import { View, Text, StyleSheet, TouchableHighlight } from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationsScreen = () => {
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
            )
        });
    });

    return (
        <View>
            <TouchableHighlight underlayColor={'gray'} onPress={() => navigation.navigate("Follow Request")}>
                <Text style={styles.headers}>Follow Requests</Text>
            </TouchableHighlight>
            <View style={{borderBottomColor: 'black', borderBottomWidth: StyleSheet.hairlineWidth}}/>
            <Text style={styles.headers}>Events</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    headers: {
        fontSize: 21,
        fontWeight: 'bold',
        paddingLeft: 10,
        paddingTop: 8,
        paddingBottom: 15
    }
})

export default NotificationsScreen