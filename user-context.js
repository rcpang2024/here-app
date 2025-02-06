import React, { createContext, useState, useEffect } from 'react';
// import { FIREBASE_AUTH } from './FirebaseConfig';
// import { onAuthStateChanged } from 'firebase/auth';
import { supabase } from './lib/supabase';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // TODO: Change Firebase to Supabase
    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
    //         setUser(user);
    //         console.log("user", user);
    //     });
    //     return () => unsubscribe();
    // }, []);
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
                console.log("Supabase user: ", user);
            } else {
                setUser(null);
            }
        });
        return () => {
            authListener?.subscription?.unsubscribe();
        };
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