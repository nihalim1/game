import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // ✅ เพิ่ม GoogleAuthProvider
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrEwHpGg9ETt4MUgSIjZx4gvBhQ62VzpA",
  authDomain: "myappgame-19413.firebaseapp.com",
  projectId: "myappgame-19413",
  storageBucket: "myappgame-19413.firebasestorage.app",
  messagingSenderId: "137419575484",
  appId: "1:137419575484:web:b72d0f393b98af5c2e80b9",
  measurementId: "G-V4V849LW0F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ เพิ่มบรรทัดนี้
export const db = getFirestore(app);

export default app;
