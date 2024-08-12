import React, { createContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            setUser(user);
            console.log("user", user);
        });
        return () => unsubscribe();
    }, []);

    const updateUserContext = (updatedUser) => {
        setUser(updatedUser);
    };

    const updateUserLocation = (coords) => {
        setUserLocation(coords);
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUserContext, userLocation, updateUserLocation }}>
            {children}
        </UserContext.Provider>
    );
};