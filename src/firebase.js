import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Yahan apne Firebase Project ki settings paste karein
const firebaseConfig = {
  apiKey: "AIzaSyAunnUpH_jL6_Z5Y6QfzjJr5oFgtduKZUU",
  authDomain: "amrutam-9645a.firebaseapp.com",
  projectId: "amrutam-9645a",
  storageBucket: "amrutam-9645a.firebasestorage.app",
  messagingSenderId: "225869881998",
  appId: "1:225869881998:web:63363554323a5db619dfdf",
  measurementId: "G-5YE06H2HD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);