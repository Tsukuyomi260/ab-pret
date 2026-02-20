// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// ⚠️ IMPORTANT : Les clés sont dans les variables d'environnement (.env)
// Ne jamais commiter les clés API dans le code source !
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ab-campus-notif.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ab-campus-notif",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ab-campus-notif.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "436866264113",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:436866264113:web:46f56ed7745a8c770df910"
};

if (!firebaseConfig.apiKey) {
  console.error('[FIREBASE] ⚠️ REACT_APP_FIREBASE_API_KEY manquante dans .env');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };