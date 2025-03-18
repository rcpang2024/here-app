import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token) => {
    const trimmedToken = token.trim(); 
    // console.log("Saving trimmed token:", trimmedToken);
    await SecureStore.setItemAsync('supabase_token', trimmedToken);
};

export const getToken = async () => {
    const token = await SecureStore.getItemAsync('supabase_token');
    // console.log("getToken: ", token);
    console.log("token being called");
    return token;
};

export const removeToken = async () => {
    await SecureStore.deleteItemAsync('supabase_token');
};