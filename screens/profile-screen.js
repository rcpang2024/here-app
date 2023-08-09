import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        // Set the right header component
        navigation.setOptions({
            headerRight: () => (
            <Ionicons
                name="reorder-three-outline"
                size={32}
                color="black"
                onPress={() => navigation.navigate("Settings")}
                style={{ marginRight: 14 }}
            />
            ),
        });
    }, [route.params]);

    return (
        <View style={styles.title}>
            <Text>Profile</Text>
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
    }
})

export default ProfileScreen;