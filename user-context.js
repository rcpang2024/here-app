import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

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