import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const FriendsScreen = () => {
    return (
        <View style={styles.container}>
          <Text>Check here for updates of your friends!</Text>
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
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '60%',
    },
    search: {
        backgroundColor: 'FFF',
        width: 250,
        height: 60,
        borderWidth: 1,
        borderColor: '#C0C0C0',
        // borderTopLeftRadius: 40,
        // borderBottomLeftRadius: 40,
    },
    searchInput: {
        marginLeft: 10,
        marginTop: 5,
        fontSize: 16,
    },
    searchButton: {
        flexDirection: 'row',
        color: 'grey',
    },
})

export default FriendsScreen;