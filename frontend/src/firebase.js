// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDWP7wZ1vx_2VjgHjNJ7AxaoRvs9Obf3Y",
  authDomain: "ab-campus-notif.firebaseapp.com",
  projectId: "ab-campus-notif",
  storageBucket: "ab-campus-notif.firebasestorage.app",
  messagingSenderId: "436866264113",
  appId: "1:436866264113:web:46f56ed7745a8c770df910"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };