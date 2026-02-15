import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration for "save-money" project
const firebaseConfig = {
  apiKey: "AIzaSyAGa8pfxlnhFIXF1ojx_8y11nCtAXgFhlA",
  authDomain: "save-money-8fc0d.firebaseapp.com",
  databaseURL: "https://save-money-8fc0d-default-rtdb.firebaseio.com",
  projectId: "save-money-8fc0d",
  storageBucket: "save-money-8fc0d.firebasestorage.app",
  messagingSenderId: "655486802525",
  appId: "1:655486802525:web:926aea2b97651425130bb4",
  measurementId: "G-LG5X54ME30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);