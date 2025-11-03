import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAEgVh_oONzeAM4heUQbVUXNlVHVBLEkao",
    authDomain: "what-to-eat-watch.firebaseapp.com",
    projectId: "what-to-eat-watch",
    storageBucket: "what-to-eat-watch.firebasestorage.app",
    messagingSenderId: "308695646567",
    appId: "1:308695646567:web:697cf58bb4917e0c10efc2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);