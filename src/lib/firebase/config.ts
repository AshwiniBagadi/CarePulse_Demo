import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEMc12t0NGZryo6oAD1wQK_K5EgsXg7zY",
  authDomain: "carepluse-21b86.firebaseapp.com",
  projectId: "carepluse-21b86",
  storageBucket: "carepluse-21b86.firebasestorage.app",
  messagingSenderId: "1081209163197",
  appId: "1:1081209163197:web:600c5382898c219e6696d4",
  measurementId: "G-GZX9JQW3TZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;