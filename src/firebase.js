import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Replace these with your real Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDKYUqsSZcKzfQCiMKnGOaiKxwMRp6Gehs",
    authDomain: "kwachadigital-c7f1a.firebaseapp.com",
    projectId: "kwachadigital-c7f1a",
    storageBucket: "kwachadigital-c7f1a.firebasestorage.app",
    messagingSenderId: "19608304743",
    appId: "1:19608304743:web:68362ec1aace71d7f328c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


export default app;
