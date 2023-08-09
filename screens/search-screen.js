import { View, Text, StyleSheet } from "react-native";

const SearchScreen = () => {
    return (
        <View style={styles.title}>
            <Text>Search for your Friends!</Text>
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

export default SearchScreen;