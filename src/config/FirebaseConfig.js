// firebase-config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5BfNeXHaRN6myaiDqvoYShhFzpX5ZBXc",
  authDomain: "rare-array-457716-j5.firebaseapp.com",
  projectId: "rare-array-457716-j5",
  storageBucket: "rare-array-457716-j5.firebasestorage.app",
  messagingSenderId: "941592993989",
  appId: "1:941592993989:web:422764bdf3ca974e9790ac",
  measurementId: "G-NE431NQQQQ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

export default database;
