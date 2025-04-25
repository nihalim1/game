import React, { createContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

// สร้าง Context สำหรับ Auth
export const AuthContext = createContext();

// สร้าง Provider ที่จะครอบ App ทั้งหมด
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // สมัครสมาชิก
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // เข้าสู่ระบบ
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // ออกจากระบบ
  const logout = () => {
    return signOut(auth);
  };

  // ส่งอีเมลเปลี่ยนรหัสผ่าน
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // เข้าระบบด้วย Google
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // ตรวจสอบการเปลี่ยนสถานะของผู้ใช้ (เช่น login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // ยกเลิก listener เมื่อ component ถูก unmount
    return unsubscribe;
  }, []);

  // ค่าที่จะแชร์ออกไป
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    googleSignIn
  };

  // แสดง children เมื่อโหลดข้อมูลเสร็จแล้วเท่านั้น
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
