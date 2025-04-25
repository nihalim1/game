import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      
      <div className="home-content">
        <div className="logo-container">
          <div className="logo-icon">
            <span>📚</span>
          </div>
          <h1>EdTech<span>Connect</span></h1>
        </div>
        
        <div className="welcome-text">
          <h2>ยินดีต้อนรับสู่ห้องเรียน</h2>
          <p>เชื่อมโยงการเรียนรู้ สร้างโอกาสทางการศึกษา พัฒนาทักษะแห่งอนาคต</p>
        </div>
        
        <div className="auth-buttons">
          <Link to="/student-auth" className="auth-button student">
            <span className="icon">👨‍🎓</span>
            <span className="text">
              <span className="title">เข้าสู่ระบบนักเรียน</span>
              <span className="subtitle">เรียนรู้ ค้นพบ พัฒนา</span>
            </span>
          </Link>
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="auth-button teacher">
            <span className="icon">👨‍🏫</span>
            <span className="text">
              <span className="title">เข้าสู่ระบบครู</span>
              <span className="subtitle">สร้างความสัมพันธ์ พัฒนาคุณภาพ</span>
            </span>
          </Link>
        </div>
        <div className="footer">
          <p>© Princess of Naradhiwas University | ระบบจัดการห้องเรียนอัจฉริยะ</p>
        </div>
      </div>
    </div>
  );
};

export default Home;