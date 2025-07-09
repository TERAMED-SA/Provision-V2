import { initializeApp } from "firebase/app";
const apiUrl = process.env.API_FIREBASE_KEY;
const firebaseConfig = {
  apiKey: apiUrl,
  authDomain: "provision-2fc17.firebaseapp.com",
  projectId: "provision-2fc17",
  storageBucket: "provision-2fc17.firebasestorage.app",
  messagingSenderId: "1060390954588",
  appId: "1:1060390954588:web:101c280798c7d8f714a899"
};

export const app = initializeApp(firebaseConfig);
