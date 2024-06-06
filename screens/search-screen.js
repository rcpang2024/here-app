import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { SearchBar } from "react-native-elements";

const SearchScreen = () => {
    const [search, setSearch] = useState('');

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <SearchBar
                    placeholder="Search for friends or events"
                    onChangeText={setSearch}
                    value={search}
                />
            </View>
        </TouchableWithoutFeedback>
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
    container: {
        flex: 1
    }
})

export default SearchScreen;