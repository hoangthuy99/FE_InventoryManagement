// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxNdZFUtf5QoQQRYYLxxIIvreZxDEref4",
  authDomain: "tracking-time-b620f.firebaseapp.com",
  projectId: "tracking-time-b620f",
  storageBucket: "tracking-time-b620f.firebasestorage.app",
  messagingSenderId: "1030742789582",
  appId: "1:1030742789582:web:8660a676cb75ca737c6f9f",
  measurementId: "G-22P2ZJP36C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database


