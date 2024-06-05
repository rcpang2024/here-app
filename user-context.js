import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const updateUserContext = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <UserContext.Provider value={{ user, setUser, updateUserContext }}>
            {children}
        </UserContext.Provider>
    );
};