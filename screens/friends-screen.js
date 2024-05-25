import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const FriendsScreen = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'first', title: 'FRIENDS EVENTS'},
        {key: 'second', title: 'FRIENDS ATTENDING'},
    ]);

    // const friendsCreatedRoute = () => {
    //     <View>
    //         <Text>FRIENDS CREATED</Text>
    //     </View>
    // };

    // const friendsAttendingRoute = () => {
    //     <View style={{flex: 1, backgroundColor: 'red'}}>
    //         <Text>FRIENDS ATTENDING</Text>
    //     </View>
    // };
    const friendsCreatedRoute = () => (
        <View>
            <Text>FRIENDS CREATED</Text>
        </View>
    );
    
    const friendsAttendingRoute = () => (
        <View style={{flex: 1, backgroundColor: 'red'}}>
            <Text>FRIENDS ATTENDING</Text>
        </View>
    );

    const renderScene = SceneMap({
        first: friendsCreatedRoute,
        second: friendsAttendingRoute
    });

    const renderTabBar = (props) => {
        return (
            <TabBar 
                {...props}
                // tabStyle={{backgroundColor: 'black',}}
                indicatorStyle={{ backgroundColor: 'black' }}
                renderLabel={({ focused, route}) => (
                    <Text style={{color: 'black', fontWeight: 'bold'}}>{route.title}</Text>
                )}
            />
        );
    };

    return (
        <View style={styles.container}>
            <TabView 
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={renderTabBar}
                style={{marginTop: 10, padding: 10}}
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