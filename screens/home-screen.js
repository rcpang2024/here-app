import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { useEffect, useState, useCallback } from "react";
import EventItem from "../components/event-item";

const HomeScreen = () => {
    const [data, setData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async() => {
        const response = await fetch('http://192.168.1.142:8000/api/events/');
        const data = await response.json();
        setData(data);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    const renderItem = ({ item }) => {
        return (
          <View style={styles.flatListContainer}>
            <EventItem
              event_id={item.id}
              creation_user={item.creation_user}
              event_name={item.event_name}
              event_description={item.event_description}
              location={item.location}
              date={item.date}
              list_of_attendees={item.list_of_attendees}
            />
          </View>
        );
    };

    return (
        <View style={styles.title}>
            <Text style={styles.format}>Some upcoming public events!</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl = {
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => onRefresh()}
                    />
                }
                contentContainerStyle={{paddingTop: 10, paddingBottom: 100}}
            />
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
    format: {
        padding: 7,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'darkred',
    },
    flatListContainer: {
        flex: 1,
        marginBottom: 10,
    },
})

export default HomeScreen;