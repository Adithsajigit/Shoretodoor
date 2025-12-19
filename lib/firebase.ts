import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPP1mamghvFxnhdM2fOwMi6E32sPI-tY0",
  authDomain: "olx-demo-a7683.firebaseapp.com",
  projectId: "olx-demo-a7683",
  storageBucket: "olx-demo-a7683.firebasestorage.app",
  messagingSenderId: "863432431834",
  appId: "1:863432431834:web:5231b866ab9f023231ede3",
  measurementId: "G-95WFYJMBTM"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
