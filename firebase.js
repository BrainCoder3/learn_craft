import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Environment variables or fallback values
const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
    return import.meta.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('REACT_APP_FIREBASE_API_KEY') || getEnv('VITE_FIREBASE_API_KEY') || "AIzaSyBPtAxqM-Wq7kGTrU8N7-5ana7hHfU_wqo",
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN') || getEnv('VITE_FIREBASE_AUTH_DOMAIN') || "gen-lang-client-0065092015.firebaseapp.com",
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID') || getEnv('VITE_FIREBASE_PROJECT_ID') || "gen-lang-client-0065092015",
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET') || getEnv('VITE_FIREBASE_STORAGE_BUCKET') || "gen-lang-client-0065092015.firebasestorage.app",
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID') || getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || "133377784724",
  appId: getEnv('REACT_APP_FIREBASE_APP_ID') || getEnv('VITE_FIREBASE_APP_ID') || "1:133377784724:web:7ded969f5a55701f32ed81"
};

console.log("Firebase connected to project: " + firebaseConfig.projectId);

const databaseId = getEnv('REACT_APP_FIREBASE_FIRESTORE_DATABASE_ID') || getEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID');

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = databaseId 
  ? getFirestore(app, databaseId) 
  : (firebaseConfig.projectId === "gen-lang-client-0065092015"
      ? getFirestore(app, "ai-studio-ebd2225a-f3dd-47a4-94f8-12baeb881300")
      : getFirestore(app));
export default app;
