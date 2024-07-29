import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2X9DC5A8rLt5rh68pZnjFVQ3jopIGTtg",
  authDomain: "here-6d3e2.firebaseapp.com",
  projectId: "here-6d3e2",
  storageBucket: "here-6d3e2.appspot.com",
  messagingSenderId: "865560800858",
  appId: "1:865560800858:web:1e0a5aded736b227b57263"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);