import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(null);

    const updateUserContext = (updatedUser) => {
        setUser(updatedUser);
    };

    const updateUserLocation = (coords) => {
        setLocation(coords);
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUserContext, location, updateUserLocation }}>
            {children}
        </UserContext.Provider>
    );
};