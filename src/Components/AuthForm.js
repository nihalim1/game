// src/components/AuthForm.js
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("เข้าสู่ระบบสำเร็จ!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("สมัครสมาชิกสำเร็จ!");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage("เข้าสู่ระบบด้วย Google สำเร็จ!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setMessage("กรุณากรอกอีเมลก่อนรีเซ็ตรหัสผ่าน");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>{isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">{isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button>
      </form>
      <button onClick={handleGoogleLogin}>เข้าสู่ระบบด้วย Google</button><br/>
      <button onClick={handleResetPassword}>ลืมรหัสผ่าน?</button>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
        {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
      </p>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AuthForm;
