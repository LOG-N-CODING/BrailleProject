// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsD5URTwRaa4kWYgzkHPpX2nUxRSKg22k",
  authDomain: "braille-app-19a76.firebaseapp.com",
  projectId: "braille-app-19a76",
  storageBucket: "braille-app-19a76.firebasestorage.app",
  messagingSenderId: "136716309530",
  appId: "1:136716309530:web:b8f9bcd350b8853e602da3",
  measurementId: "G-RYP85ZKBYN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
