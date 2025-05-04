// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCw7Jf6eECIUGKt4LP3K44ExGSW2iqm1kI",
  authDomain: "shpping-91bf8.firebaseapp.com",
  projectId: "shpping-91bf8",
  storageBucket: "shpping-91bf8.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  databaseURL: "https://shpping-91bf8-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export { db };
