import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const meta = import.meta as any;

const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  if (meta.env?.[key]) {
    return meta.env[key];
  }
  return undefined;
};

const hasValidLocalConfig = firebaseConfigJson && firebaseConfigJson.projectId && firebaseConfigJson.projectId !== 'remixed-project-id';

const firebaseConfig = {
  apiKey: getEnv('REACT_APP_FIREBASE_API_KEY') || getEnv('VITE_FIREBASE_API_KEY') || (hasValidLocalConfig ? firebaseConfigJson.apiKey : undefined) || "AIzaSyBPtAxqM-Wq7kGTrU8N7-5ana7hHfU_wqo",
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN') || getEnv('VITE_FIREBASE_AUTH_DOMAIN') || (hasValidLocalConfig ? firebaseConfigJson.authDomain : undefined) || "gen-lang-client-0065092015.firebaseapp.com",
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID') || getEnv('VITE_FIREBASE_PROJECT_ID') || (hasValidLocalConfig ? firebaseConfigJson.projectId : undefined) || "gen-lang-client-0065092015",
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET') || getEnv('VITE_FIREBASE_STORAGE_BUCKET') || (hasValidLocalConfig ? firebaseConfigJson.storageBucket : undefined) || "gen-lang-client-0065092015.firebasestorage.app",
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID') || getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || (hasValidLocalConfig ? firebaseConfigJson.messagingSenderId : undefined) || "133377784724",
  appId: getEnv('REACT_APP_FIREBASE_APP_ID') || getEnv('VITE_FIREBASE_APP_ID') || (hasValidLocalConfig ? firebaseConfigJson.appId : undefined) || "1:133377784724:web:7ded969f5a55701f32ed81"
};

console.log("Firebase connected to project: " + firebaseConfig.projectId);

const databaseId = getEnv('REACT_APP_FIREBASE_FIRESTORE_DATABASE_ID') || getEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || (hasValidLocalConfig && firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== 'remixed-firestore-database-id' ? firebaseConfigJson.firestoreDatabaseId : undefined);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = databaseId 
  ? getFirestore(app, databaseId) 
  : (firebaseConfig.projectId === "gen-lang-client-0065092015"
      ? getFirestore(app, "ai-studio-ebd2225a-f3dd-47a4-94f8-12baeb881300")
      : getFirestore(app));
export default app;
