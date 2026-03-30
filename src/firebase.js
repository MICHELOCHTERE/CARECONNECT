import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbbruYE4Q3Qnq0ZUJQw4A8vtgFw0WXgLo",
  authDomain: "careconnect-29a6f.firebaseapp.com",
  projectId: "careconnect-29a6f",
  storageBucket: "careconnect-29a6f.firebasestorage.app",
  messagingSenderId: "644594053889",
  appId: "1:644594053889:web:05bd533c17ae48efdbe100"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
