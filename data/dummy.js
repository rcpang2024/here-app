import { useState } from "react"

export const USER_1 = 
    {id: 1, username: 'rcpang', name: 'Ray Pang', email: 'rcpang@email.unc.edu', 
    phone_number: '336-111-1111', user_type: 'individual'}

export const USER_2 = 
    {id: 2, username: 'clove', name: 'Caleb Love', email: 'clove@email.unc.edu', 
    phone_number: '336-222-2222', user_type: 'individual'}

export const USER_3 = 
    {id: 3, username: 'novak', name: 'Novak Djokovic', email: 'goat@gmail.com', 
    phone_number: '111-222-2222', user_type: 'individual'}

export const listOfAttendees1 = [
    USER_1.username, USER_2.username
]

export const listOfAttendees2 = [
    USER_1.username, USER_3.username
]

export const listOfAttendees3 = [
    USER_2.username, USER_3.username
]

export const useEvents = () => {
    const [events, setEvents] = useState([
        {event_id: 0, creation_user: USER_1, event_name: 'Title with a very long description to see what it may look like', 
        event_description: 
        'This is a very long description to see what it may look like if people typed a lot. Hopefully they will get the message though.', 
        location: 'Lusail Stadium', date:'12/18/22', list_of_attendees: listOfAttendees1},
        {event_id: 1, creation_user: USER_2, event_name: 'NCAA Finals', event_description: 'NCAA', location: 'Kenan Stadium', date:'3/18/22',
            list_of_attendees: listOfAttendees2},
        {event_id: 2, creation_user: USER_3, event_name: 'Wimbledon', event_description: 'Tennis', location: 'UK', date:'7/6/23',
            list_of_attendees: listOfAttendees3},
        {event_id: 3, creation_user: USER_1, event_name: 'Dinner', event_description: 'Eating food', location: 'Four Corners', date:'7/10/23',
            list_of_attendees: listOfAttendees1},
        {event_id: 4, creation_user: USER_2, event_name: 'Bar Hopping', event_description: 'Drinking', location: 'Might As Well', date:'7/11/23',
            list_of_attendees: listOfAttendees2},
        {event_id: 5, creation_user: USER_3, event_name: 'Lunch', event_description: 'More food', location: 'Durham', date:'7/12/23',
            list_of_attendees: listOfAttendees3},
    ]);
    const addEvent = (newEvent) => {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        console.log("Within addEvent inside dummy.js: " + events.length);
        console.log("WITHIN DUMMY.JS: ", events);
    };
    return { events, addEvent };
}
