// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEgVh_oONzeAM4heUQbVUXNlVHVBLEkao",
  authDomain: "what-to-eat-watch.firebaseapp.com",
  projectId: "what-to-eat-watch",
  storageBucket: "what-to-eat-watch.firebasestorage.app",
  messagingSenderId: "308695646567",
  appId: "1:308695646567:web:697cf58bb4917e0c10efc2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);