import React, { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentAuthForm.css';
import { useNotification } from '../contexts/NotificationContext';
import { AuthContext } from '../contexts/AuthContext';

const StudentAuthForm = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const { customLogin } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        classroom: '',
        age: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasShownSuccess, setHasShownSuccess] = useState(false);

    // ฟังก์ชันตรวจสอบข้อมูล
    const validateForm = useCallback(() => {
        if (!formData.email || !formData.password) {
            setMessage('กรุณากรอกอีเมลและรหัสผ่าน');
            return false;
        }

        if (!isLogin) {
            if (!formData.student_id || !formData.first_name || !formData.last_name || 
                !formData.classroom || !formData.age) {
                setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                setMessage('รหัสผ่านไม่ตรงกัน');
                return false;
            }

            if (formData.password.length < 6) {
                setMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
                return false;
            }
        }

        return true;
    }, [formData, isLogin]);

    // ฟังก์ชันจัดการการ submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setMessage('');

        try {
            const endpoint = `${isLogin ? 'student_login.php' : 'student_signup.php'}`;
            
            // เตรียมข้อมูลสำหรับส่งไป API
            const payload = isLogin ? {
                email: formData.email,
                password: formData.password
            } : {
                student_id: formData.student_id,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                classroom: formData.classroom,
                age: parseInt(formData.age)
            };

            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000, // 10 วินาที
                baseURL: 'http://mgt2.pnu.ac.th/kong/app-game/'
            });

            if (response.data.success) {
                if (isLogin) {
                    // เก็บข้อมูลนักเรียนใน localStorage
                    localStorage.setItem('student', JSON.stringify(response.data.data));
                    customLogin(response.data.data);
                    setMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าถัดไป...');
                    
                    // รอสักครู่แล้วนำทางไปหน้า dashboard
                    setTimeout(() => {
                        navigate('/student-dashboard');
                    }, 1500);

                    // เมื่อล็อกอินสำเร็จ
                    if (!hasShownSuccess) {
                        addNotification({
                            type: 'success',
                            title: 'เข้าสู่ระบบสำเร็จ',
                            message: 'ยินดีต้อนรับกลับมา!'
                        });
                        setHasShownSuccess(true);

                        // ตั้งเวลาให้แจ้งเตือนหายไปหลังจาก 3 วินาที
                        setTimeout(() => {
                            setHasShownSuccess(false);
                        }, 3000);
                    }
                } else {
                    // สมัครสมาชิกสำเร็จ → login อัตโนมัติ
                    // ส่ง request login ทันที
                    try {
                        const loginResponse = await axios.post('student_login.php', {
                            email: formData.email,
                            password: formData.password
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            baseURL: 'http://mgt2.pnu.ac.th/kong/app-game/'
                        });

                        if (loginResponse.data.success) {
                            localStorage.setItem('student', JSON.stringify(loginResponse.data.data));
                            customLogin(loginResponse.data.data);
                            setMessage('ลงทะเบียนและเข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าถัดไป...');
                            setTimeout(() => {
                                navigate('/student-dashboard');
                            }, 1500);
                        } else {
                            setMessage('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
                            setTimeout(() => {
                                setIsLogin(true);
                                setFormData({
                                    student_id: '',
                                    first_name: '',
                                    last_name: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                    classroom: '',
                                    age: ''
                                });
                            }, 1500);
                        }
                    } catch (e) {
                        setMessage('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
                        setTimeout(() => {
                            setIsLogin(true);
                            setFormData({
                                student_id: '',
                                first_name: '',
                                last_name: '',
                                email: '',
                                password: '',
                                confirmPassword: '',
                                classroom: '',
                                age: ''
                            });
                        }, 1500);
                    }
                }
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'เกิดข้อผิดพลาด',
                message: error.response?.data?.message || 'ไม่สามารถเข้าสู่ระบบได้'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="student-auth-container">
            <div className="home-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div>
            
            <div className="student-auth-content">
                <div className="logo-container">
                    <div className="logo-icon">
                        <span>{isLogin ? '🔑' : '📝'}</span>
                    </div>
                    <h1>EdTech<span>Connect</span></h1>
                </div>
                
                <div className="student-auth-box">
                    <h2>{isLogin ? 'เข้าสู่ระบบนักเรียน' : 'ลงทะเบียนนักเรียน'}</h2>
                    
                    <div className="welcome-text">
                        <p>{isLogin 
                            ? 'ยินดีต้อนรับกลับมา กรุณาลงชื่อเข้าใช้เพื่อเข้าสู่ระบบ' 
                            : 'กรุณากรอกข้อมูลเพื่อสร้างบัญชีใหม่และเริ่มต้นการเรียนรู้'
                        }</p>
                    </div>
                    
                    {message && (
                        <div className={`message-box ${message.includes('สำเร็จ') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="student-form">
                        {!isLogin && (
                            <div className="form-row">
                                <div className="student-form-group">
                                    <label>รหัสนักเรียน</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🆔</span>
                                        <input
                                            type="text"
                                            value={formData.student_id}
                                            onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                                            placeholder="กรอกรหัสนักเรียน"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!isLogin && (
                            <div className="form-row two-columns">
                                <div className="student-form-group">
                                    <label>ชื่อ</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                            placeholder="กรอกชื่อ"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="student-form-group">
                                    <label>นามสกุล</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        placeholder="กรอกนามสกุล"
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        
                        {!isLogin && (
                            <div className="form-row two-columns">
                                <div className="student-form-group">
                                    <label>ชั้นเรียน</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🏫</span>
                                        <input
                                            type="text"
                                            value={formData.classroom}
                                            onChange={(e) => setFormData({...formData, classroom: e.target.value})}
                                            placeholder="เช่น ป.6/1"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="student-form-group">
                                    <label>อายุ</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon">🎂</span>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                                            placeholder="กรอกอายุ"
                                            required
                                            min="7"
                                            max="15"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="student-form-group">
                            <label>อีเมล</label>
                            <div className="input-with-icon">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="กรอกอีเมล"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="student-form-group">
                            <label>รหัสผ่าน</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="กรอกรหัสผ่าน"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="student-form-group">
                                <label>ยืนยันรหัสผ่าน</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">🔐</span>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        placeholder="ยืนยันรหัสผ่าน"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="student-submit-btn" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <>
                                {isLogin ? '🚀 เข้าสู่ระบบ' : '✨ ลงทะเบียน'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-actions">
                        <button 
                            className="student-switch-mode"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage('');
                                setFormData({
                                    student_id: '',
                                    first_name: '',
                                    last_name: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                    classroom: '',
                                    age: ''
                                });
                            }}
                            disabled={isLoading}
                        >
                            {isLogin ? '📝 ลงทะเบียนใหม่' : '⬅️ กลับไปหน้าเข้าสู่ระบบ'}
                        </button>
                        
                        <button 
                            className="go-back-btn"
                            onClick={() => navigate('/')}
                        >
                            🏠 กลับหน้าหลัก
                        </button>
                    </div>
                </div>
                
                <div className="footer">
                    <p>© 2023 EdTech Connect | ระบบจัดการห้องเรียนอัจฉริยะ</p>
                </div>
            </div>
        </div>
    );
};

export default StudentAuthForm;