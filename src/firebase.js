
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbwMlaLgD8XIJ4-QWOjsr5UC_ZKlKOiX0",
  authDomain: "japantrip-ba161.firebaseapp.com",
  projectId: "japantrip-ba161",
  storageBucket: "japantrip-ba161.firebasestorage.app",
  messagingSenderId: "355352644201",
  appId: "1:355352644201:web:4c4a34f8161dce3bb3f0f8",
  measurementId: "G-43NB1TYRQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
