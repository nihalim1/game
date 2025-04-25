import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeachersAuthForm.css';

const TeachersAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('teacher');
    if (user) {
      navigate('/teacher-dashboard');
    }
  }, [navigate]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const { email, password, name, lname, confirmPassword } = formData;
    setMessage('');

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return setMessage('กรุณากรอกอีเมล') || false;
    if (!emailPattern.test(email)) return setMessage('รูปแบบอีเมลไม่ถูกต้อง') || false;

    // Password validation
    if (!password) return setMessage('กรุณากรอกรหัสผ่าน') || false;
    if (password.length < 8) return setMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร') || false;

    // Additional signup validations
    if (!isLogin) {
      if (!name) return setMessage('กรุณากรอกชื่อ') || false;
      if (name.length < 2) return setMessage('ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร') || false;

      if (!lname) return setMessage('กรุณากรอกนามสกุล') || false;
      if (lname.length < 2) return setMessage('นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร') || false;

      if (!confirmPassword) return setMessage('กรุณายืนยันรหัสผ่าน') || false;
      if (password !== confirmPassword) return setMessage('รหัสผ่านไม่ตรงกัน') || false;
    }

    return true;
  }, [formData, isLogin]);

  // Handle authentication
  const handleAuth = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const endpoint = `http://mgt2.pnu.ac.th/kong/app-game/${isLogin ? 'teacher_login.php' : 'teacher_signup.php'}`;
      
      const payload = isLogin 
        ? { 
            email: formData.email.trim(), 
            password: formData.password 
          }
        : {
            name: formData.name.trim(),
            lname: formData.lname.trim(),
            email: formData.email.trim(),
            password: formData.password
          };

      console.log('Sending request to:', endpoint);
      console.log('Payload:', JSON.stringify(payload));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      
      // ใช้ try-catch ในการแปลง JSON เนื่องจากอาจมีข้อผิดพลาด
      let data;
      try {
        const text = await response.text();
        console.log('Response text:', text);
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        throw new Error('รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง');
      }

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }

      if (data.success) {
        if (isLogin) {
          // Store teacher data and redirect
          const teacherData = {
            id: data.data.id,
            name: data.data.name,
            lname: data.data.lname,
            email: data.data.email,
            token: data.token
          };
          
          localStorage.setItem('teacher', JSON.stringify(teacherData));
          
          setMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าถัดไป...');
          setTimeout(() => navigate('/teacher-dashboard'), 1500);
        } else {
          // Reset form and switch to login
          setMessage('ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({
              name: '',
              lname: '',
              email: '',
              password: '',
              confirmPassword: ''
            });
          }, 1500);
        }
      } else {
        setMessage(data.message || (isLogin ? 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่' : 'การลงทะเบียนล้มเหลว กรุณาลองใหม่'));
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage(
        error.message || 
        (isLogin 
          ? 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่ภายหลัง'
          : 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLogin, formData, validateForm, navigate]);

  // Toggle between login and signup
  const toggleAuthMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setMessage('');
    setFormData({
      name: '',
      lname: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  }, []);

  return (
    <div className="teacher-auth-container">
      <div className="teacher-auth-box">
        <h2>{isLogin ? 'เข้าสู่ระบบครู' : 'ลงทะเบียนครู'}</h2>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleAuth();
        }}>
          {!isLogin && (
            <>
              <div className="teacher-form-group">
                <label htmlFor="name">ชื่อ</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="กรอกชื่อ"
                  autoComplete="given-name"
                  disabled={isLoading}
                />
              </div>

              <div className="teacher-form-group">
                <label htmlFor="lname">นามสกุล</label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={handleInputChange}
                  placeholder="กรอกนามสกุล"
                  autoComplete="family-name"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="teacher-form-group">
            <label htmlFor="email">อีเมล</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="กรอกอีเมล"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="teacher-form-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="กรอกรหัสผ่าน"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />
          </div>

          {!isLogin && (
            <div className="teacher-form-group">
              <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="ยืนยันรหัสผ่าน"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('สำเร็จ') ? 'teacher-success-message' : 'teacher-error-message'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="teacher-submit-btn"
            disabled={isLoading}
          >
            {isLoading 
              ? (isLogin ? 'กำลังเข้าสู่ระบบ...' : 'กำลังลงทะเบียน...') 
              : (isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน')}
          </button>
        </form>

        <button
          onClick={toggleAuthMode}
          className="teacher-switch-mode"
          disabled={isLoading}
        >
          {isLogin ? 'ยังไม่มีบัญชี? ลงทะเบียน' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
        </button>
      </div>
    </div>
  );
};

export default TeachersAuthForm;
