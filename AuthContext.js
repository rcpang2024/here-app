import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { saveToken } from "./secureStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [idToken, setIdToken] = useState(null);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = await getToken();
            if (storedToken) {
                setIdToken(storedToken);
            } else {
                const { data } = await supabase.auth.getSession();
                if (data?.session?.access_token) {
                    await saveToken(data.session.access_token);
                    setIdToken(data.session.access_token);
                }
            }
        }
        initializeAuth();

        const {data: listener} = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.access_token) {
                setIdToken(session.access_token);
                await saveToken(session.access_token);
            } else {
                setIdToken(null);
                await removeToken();
            }
        });
        return () => listener?.subscription?.unsubscribe();
    }, [])

    return (
        <AuthContext.Provider value={idToken}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);