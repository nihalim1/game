import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import { useNotification } from '../contexts/NotificationContext';

const GAME_DETAILS = {
    codingGame: {
        icon: '💻',
        label: 'เกมโค้ดดิ้ง',
        desc: 'เรียนรู้พื้นฐานการเขียนโค้ดผ่านเกมที่สนุกและท้าทาย',
        route: '/coding-game'
    },
    bridgeGame: {
        icon: '🌉',
        label: 'เกมสร้างสะพาน',
        desc: 'ฝึกทักษะวิศวกรรมและการแก้ปัญหาผ่านการสร้างสะพาน',
        route: '/bridge-game'
    },
    mathPuzzle: {
        icon: '🔢',
        label: 'เกม Math Puzzle',
        desc: 'ฝึกทักษะการคิดคำนวณและแก้โจทย์ปัญหาคณิตศาสตร์',
        route: '/math-puzzle'
    },
    mazeGame: {
        icon: '🎮',
        label: 'เกม Maze',
        desc: 'ฝึกตรรกะและการวางแผนในเขาวงกต',
        route: '/MazeGame'
    },
    
};

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [studentName, setStudentName] = useState('นักเรียน');
    const [studentId, setStudentId] = useState('');
    const [progress, setProgress] = useState({});
    const [hasShownWelcome, setHasShownWelcome] = useState(false);
    const [enabledGames, setEnabledGames] = useState({});
    const [completedGames, setCompletedGames] = useState({});

    useEffect(() => {
        // โหลดข้อมูลนักเรียนจาก localStorage ก่อน
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        if (student.name) {
            setStudentName(student.name);
        }
        if (student.student_id) {
            setStudentId(student.student_id);
        }

        // แสดงการแจ้งเตือนเมื่อเข้าสู่ระบบสำเร็จ (เฉพาะครั้งแรก)
        if (!hasShownWelcome && student.name) {
            addNotification({
                type: 'success',
                title: 'เข้าสู่ระบบสำเร็จ',
                message: `ยินดีต้อนรับกลับมา ${student.name}!`,
                duration: 5000
            });
            setHasShownWelcome(true);
        }
    }, [hasShownWelcome, addNotification]);

    useEffect(() => {
        // ดึงข้อมูลเกมที่เปิดใช้งานจาก backend
        fetch('http://mgt2.pnu.ac.th/kong/app-game/get_game_settings.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch game settings');
                }
                return res.json();
            })
            .then(data => {
                console.log('game settings:', data);
                if (!data || Object.keys(data).length === 0) {
                    // fallback กรณี API ว่าง
                    setEnabledGames({
                        matchingGame: { enabled: true, order: 1 },
                        codingGame: { enabled: true, order: 2 },
                        bridgeGame: { enabled: true, order: 3 },
                        mathPuzzle: { enabled: true, order: 4 },
                        mazeGame: { enabled: true, order: 5 }
                    });
                } else {
                    setEnabledGames(data);
                }
            })
            .catch(error => {
                console.error('Error fetching game settings:', error);
                // fallback กรณีเกิด error
                setEnabledGames({
                    matchingGame: { enabled: true, order: 1 },
                    codingGame: { enabled: true, order: 2 },
                    bridgeGame: { enabled: true, order: 3 },
                    mathPuzzle: { enabled: true, order: 4 },
                    mazeGame: { enabled: true, order: 5 }
                });
            });
    }, []);

    useEffect(() => {
        // โหลดข้อมูลความก้าวหน้าของนักเรียน
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        if (student.student_id) {
            fetch(`http://mgt2.pnu.ac.th/kong/app-game/get_scores.php?student_id=${student.student_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch scores');
                }
                return res.json();
            })
            .then(data => {
                const completed = {};
                if (data && data.data && Array.isArray(data.data)) {
                    data.data.forEach(row => {
                        if (row.score > 0) {
                            completed[row.game_type] = true;
                        }
                    });
                }
                setCompletedGames(completed);
            })
            .catch(err => {
                console.error('Error fetching scores:', err);
                setCompletedGames({});
            });
        }
    }, []);

    const handleLogout = () => {
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        localStorage.removeItem('student');
        addNotification({
            type: 'info',
            title: 'ออกจากระบบสำเร็จ',
            message: `ขอบคุณที่ใช้บริการ ${student.name || 'นักเรียน'}!`,
            duration: 5000
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
                        <p>รหัสนักเรียน: {studentId}</p>
                        <p>ยินดีต้อนรับกลับมา เรามีเกมการเรียนรู้ที่น่าสนใจมากมายรอคุณอยู่</p>
                    </div>
                    <div className="profile-avatar">
                        {studentName.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                <div className="games-section">
                    <h2 className="section-title">เกมการเรียนรู้</h2>
                    <div className="game-cards">
                        {Object.entries(enabledGames)
                            .filter(([key, game]) => game.enabled && GAME_DETAILS[key]) // ตรวจสอบว่ามีข้อมูลเกมใน GAME_DETAILS
                            .sort((a, b) => a[1].order - b[1].order)
                            .map(([key, game]) => (
                                <div
                                    className={`game-card${completedGames[key] ? ' completed' : ''}`}
                                    data-game={key}
                                    key={key}
                                >
                                    <div className="game-icon">{GAME_DETAILS[key]?.icon}</div>
                                    <h3>{GAME_DETAILS[key]?.label}</h3>
                                    <p>{GAME_DETAILS[key]?.desc}</p>
                                    {completedGames[key] && (
                                        <div className="game-completed-badge">✔️ เล่นสำเร็จแล้ว</div>
                                    )}
                                    <button 
                                        className="play-button" 
                                        onClick={() => navigate(GAME_DETAILS[key]?.route)}
                                    >
                                        เริ่มเล่นเกม
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;