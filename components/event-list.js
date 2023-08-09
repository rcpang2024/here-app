import { View, Text, FlatList, RefreshControl, StyleSheet} from "react-native";
import { useEffect, useState, useCallback } from "react";
// import { useEvents } from "../data/dummy";
import EventItem from "./event-item";

const EventList = ({data}) => {
    // const { events, addEvent } = useEvents();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
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

    return(
        <View>
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

const styles = StyleSheet.create({
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

export default EventList;