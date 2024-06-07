import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { SearchBar } from "react-native-elements";

const SearchScreen = () => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [eventResults, setEventResults] = useState([]);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const searchDatabase = async (query) => {
        try {
            // Placeholder 
            const response = await fetch(`http://192.168.1.142:8000/api/search?query=${query}`);
            const data = await response.json();
            setResults(data);
            // setEventResults(data.events);
        } catch (error) {
            console.error("Error searching the database: ", error);
        }
    };

    useEffect(() => {
        if (search.length > 0) {
            searchDatabase(search);
        } else {
            setResults([]);
            // setEventResults([]);
        }
    }, [search]);

    const renderUserItem = ({ item }) => (
        <View>
            <TouchableOpacity onPress={() => console.log(item.username)}>
                <Text style={styles.resultText}>{item.username}</Text>
            </TouchableOpacity>
        </View>
    );

    // const renderEventItem = ({ item }) => (
    //     <View style={styles.resultItem}>
    //         <Text style={styles.resultText}>{item.event_name}</Text>
    //         <Text style={styles.resultText}>{item.description}</Text>
    //     </View>
    // );

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <SearchBar
                    placeholder="Search for friends or events"
                    onChangeText={setSearch}
                    value={search}
                />
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUserItem}
                    contentContainerStyle={styles.resultsContainer}
                />
                {/* <Text style={styles.sectionHeader}>Events</Text>
                <FlatList
                    data={eventResults}
                    keyExtractor={(item) => `event-${item.id.toString()}`}
                    renderItem={renderEventItem}
                    contentContainerStyle={styles.resultsContainer}
                /> */}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    resultText: {
        fontSize: 20,
        padding: 10
    }
})

export default SearchScreen;