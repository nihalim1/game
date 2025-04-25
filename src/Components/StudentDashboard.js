import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import { useNotification } from '../contexts/NotificationContext';
import { getAllProgress } from '../utils/gameProgress';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [studentName, setStudentName] = useState('นักเรียน');
    const [progress, setProgress] = useState({
        matchingGame: { percentage: 0, level: 0, total: 10 },
        codingGame: { percentage: 0, level: 0, total: 8 },
        bridgeGame: { percentage: 0, level: 0, total: 10 },
        mathPuzzle: { percentage: 0, level: 0, total: 10 }
    });

    useEffect(() => {
        // โหลดข้อมูลนักเรียน
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        if (student.name) {
            setStudentName(student.name);
        }
        
        // โหลดความก้าวหน้าแยกตามเกม
        const allProgress = getAllProgress();
        
        const newProgress = {
            matchingGame: {
                percentage: calculatePercentage(allProgress.matchingGame?.completedLevels || 0, 10),
                level: allProgress.matchingGame?.completedLevels || 0,
                total: 10
            },
            codingGame: {
                percentage: calculatePercentage(allProgress.codingGame?.completedLevels || 0, 8),
                level: allProgress.codingGame?.completedLevels || 0,
                total: 8
            },
            bridgeGame: {
                percentage: calculatePercentage(allProgress.bridgeGame?.completedLevels || 0, 10),
                level: allProgress.bridgeGame?.completedLevels || 0,
                total: 10
            },
            mathPuzzle: {
                percentage: calculatePercentage(allProgress.mathPuzzle?.completedLevels || 0, 10),
                level: allProgress.mathPuzzle?.completedLevels || 0,
                total: 10
            }
        };
        
        setProgress(newProgress);
        
        // แสดงความก้าวหน้าด้วยอนิเมชัน
        setTimeout(() => {
            document.querySelectorAll('.progress-bar-fill').forEach((bar, index) => {
                const values = Object.values(newProgress).map(p => p.percentage);
                bar.style.width = `${values[index]}%`;
            });
        }, 500);
        
    }, []);

    useEffect(() => {
        // แสดงการแจ้งเตือนเมื่อเข้าสู่ระบบสำเร็จ
        addNotification({
            type: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            message: 'ยินดีต้อนรับกลับมา!'
        });
    }, []);

    const calculatePercentage = (completed, total) => {
        return Math.round((completed / total) * 100);
    };

    const handleLogout = () => {
        localStorage.removeItem('student');
        addNotification({
            type: 'success',
            title: 'ออกจากระบบสำเร็จ',
            message: 'กลับมาเยี่ยมเราใหม่นะ!'
        });
        navigate('/student-auth');
    };

    return (
        <div className="student-dashboard">
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <h1>Student Dashboard</h1>
                </div>
                <div className="nav-right">
                    <button 
                        className="history-btn"
                        onClick={() => navigate('/game-history')}
                    >
                        <span className="history-icon">📊</span>
                        ประวัติการเล่น
                    </button>
                    
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <span className="logout-icon">🚪</span>
                        ออกจากระบบ
                    </button>
                </div>
            </nav>
            
            <div className="dashboard-content">
                <div className="welcome-section">
                    <div className="welcome-text">
                        <h2>สวัสดี, {studentName}!</h2>
                        <p>ยินดีต้อนรับกลับมา เรามีเกมการเรียนรู้ที่น่าสนใจมากมายรอคุณอยู่</p>
                    </div>
                    <div className="profile-avatar">
                        {studentName.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                {/* ลบส่วนการ์ดแบบทดสอบ คะแนนล่าสุด และรางวัลออก */}
                
                <div className="games-section">
                    <h2 className="section-title">เกมการเรียนรู้</h2>
                    
                    <div className="game-cards">
                        <div className="game-card" data-game="matching-game">
                            <div className="game-icon">🦁</div>
                            <h3>เกมจับคู่สัตว์</h3>
                            <p>ฝึกความจำและการจับคู่ผ่านการเรียนรู้เกี่ยวกับสัตว์ต่างๆ</p>
                            <button className="play-button" onClick={() => navigate('/game')}>
                                เริ่มเล่นเกม
                            </button>
                        </div>
                        
                        <div className="game-card" data-game="coding-game">
                            <div className="game-icon">💻</div>
                            <h3>เกมโค้ดดิ้ง</h3>
                            <p>เรียนรู้พื้นฐานการเขียนโค้ดผ่านเกมที่สนุกและท้าทาย</p>
                            <button className="play-button" onClick={() => navigate('/coding-game')}>
                                เริ่มเล่นเกม
                            </button>
                        </div>
                        
                        <div className="game-card" data-game="bridge-game">
                            <div className="game-icon">🌉</div>
                            <h3>เกมสร้างสะพาน</h3>
                            <p>ฝึกทักษะวิศวกรรมและการแก้ปัญหาผ่านการสร้างสะพาน</p>
                            <button className="play-button" onClick={() => navigate('/bridge-game')}>
                                เริ่มเล่นเกม
                            </button>
                        </div>
                        
                        <div className="game-card" data-game="math-puzzle">
                            <div className="game-icon">🔢</div>
                            <h3>เกม Math Puzzle</h3>
                            <p>ฝึกทักษะการคิดคำนวณและแก้โจทย์ปัญหาคณิตศาสตร์</p>
                            <button className="play-button" onClick={() => navigate('/math-puzzle')}>
                                เริ่มเล่นเกม
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="progress-section">
                    <h2 className="section-title">ความก้าวหน้า</h2>
                    
                    <div className="progress-snapshot">
                        <div className="progress-cards">
                            <div className="progress-card">
                                <div className="progress-icon">🦁</div>
                                <div className="progress-info">
                                    <h4>เกมจับคู่สัตว์</h4>
                                    <p>ความก้าวหน้า: {progress.matchingGame.percentage}%</p>
                                    <p className="level-info">ด่านที่ {progress.matchingGame.level}/{progress.matchingGame.total}</p>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="progress-card">
                                <div className="progress-icon">💻</div>
                                <div className="progress-info">
                                    <h4>เกมโค้ดดิ้ง</h4>
                                    <p>ความก้าวหน้า: {progress.codingGame.percentage}%</p>
                                    <p className="level-info">ด่านที่ {progress.codingGame.level}/{progress.codingGame.total}</p>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="progress-card">
                                <div className="progress-icon">🌉</div>
                                <div className="progress-info">
                                    <h4>เกมสร้างสะพาน</h4>
                                    <p>ความก้าวหน้า: {progress.bridgeGame.percentage}%</p>
                                    <p className="level-info">ด่านที่ {progress.bridgeGame.level}/{progress.bridgeGame.total}</p>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="progress-card">
                                <div className="progress-icon">🔢</div>
                                <div className="progress-info">
                                    <h4>เกม Math Puzzle</h4>
                                    <p>ความก้าวหน้า: {progress.mathPuzzle.percentage}%</p>
                                    <p className="level-info">ด่านที่ {progress.mathPuzzle.level}/{progress.mathPuzzle.total}</p>
                                    <div className="progress-bar">
                                        <div className="progress-bar-fill"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;