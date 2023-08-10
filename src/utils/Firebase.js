// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "fftools-cc437.firebaseapp.com",
  projectId: "fftools-cc437",
  storageBucket: "fftools-cc437.appspot.com",
  messagingSenderId: "793656607519",
  appId: "1:793656607519:web:7b570e22bdfe8ffd4f262a",
  measurementId: "G-9SX5JT2D66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

getAnalytics(app);

export {
  auth,
  db,
  storage,
  googleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail  // Add this line to export the function
};
