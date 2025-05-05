import React, { useState, useEffect } from 'react';
import './MathPuzzle.css';
import { useNotification } from '../contexts/NotificationContext';

import { useNavigate } from 'react-router-dom';

// คอมโพเนนต์ HintPopup สำหรับแสดงคำใบ้แบบป๊อปอัพ
const HintPopup = ({ hint, onClose, levelNumber }) => {
    useEffect(() => {
        document.body.classList.add('popup-active');
        
        return () => {
            document.body.classList.remove('popup-active');
        };
    }, []);
    
    return (
        <div className="hint-popup">
            <div className="hint-popup-title">🔍 คำใบ้สำหรับด่านที่ {levelNumber}</div>
            <div className="hint-popup-content">{hint}</div>
            <button className="hint-popup-close" onClick={onClose}>เข้าใจแล้ว</button>
        </div>
    );
};

// เพิ่มคอมโพเนนต์ LevelSelector สำหรับเลือกด่าน
const LevelSelector = ({ levels, currentLevel, setCurrentLevel, completedLevels, onClose }) => {
    useEffect(() => {
        document.body.classList.add('popup-active');
        
        return () => {
            document.body.classList.remove('popup-active');
        };
    }, []);
    
    return (
        <div className="level-selector-popup">
            <div className="level-selector-title">เลือกด่าน</div>
            <div className="level-selector-content">
                <div className="level-grid">
                    {levels.map((level, index) => (
                        <button
                            key={index}
                            className={`level-button ${index + 1 === currentLevel ? 'current' : ''} ${index + 1 <= completedLevels ? 'unlocked' : 'locked'}`}
                            onClick={() => {
                                if (index + 1 <= completedLevels + 1) {
                                    setCurrentLevel(index + 1);
                                    onClose();
                                }
                            }}
                            disabled={index + 1 > completedLevels + 1}
                        >
                            <span className="level-number">{index + 1}</span>
                            {index + 1 <= completedLevels && <span className="completed-indicator">✓</span>}
                        </button>
                    ))}
                </div>
            </div>
            <button className="level-selector-close" onClick={onClose}>ปิด</button>
        </div>
    );
};

const MathPuzzle = () => {
    const navigate = useNavigate();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [answer, setAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0); // เวลาที่ใช้จริง (นับขึ้น)
    const [timerInterval, setTimerInterval] = useState(null); // สำหรับ clearInterval
    const [isPlaying, setIsPlaying] = useState(false);
    const [stars, setStars] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const { addNotification } = useNotification();
    const [showHintPopup, setShowHintPopup] = useState(false);
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [completedLevels, setCompletedLevels] = useState(0);
    const [animating, setAnimating] = useState(false); // สถานะสำหรับอนิเมชัน
    const [totalStars, setTotalStars] = useState(0); // คะแนนดาวรวมทั้งหมด
    const [starsPerLevel, setStarsPerLevel] = useState({}); // เก็บดาวแต่ละด่าน
    const [highestScore, setHighestScore] = useState(0); // คะแนนสูงสุด
    const [modalContent, setModalContent] = useState({ title: '', message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usedTimePerLevel, setUsedTimePerLevel] = useState({}); // เก็บเวลาที่ใช้จริงแต่ละด่าน

    // ข้อมูลทุกด่าน
    const levels = [
        {
            title: "ด่านที่ 1: บวกเลขง่ายๆ",
            question: "น้องแป้งมีขนม 15 ชิ้น และได้รับขนมเพิ่มอีก 10 ชิ้น น้องแป้งมีขนมทั้งหมดกี่ชิ้น?",
            answer: "25",
            hint: "ให้บวกจำนวนขนมที่มีอยู่กับจำนวนขนมที่ได้รับเพิ่ม",
            timeLimit: 30,
            points: 100
        },
        {
            title: "ด่านที่ 2: ลบเลขและลำดับ",
            question: "ถ้าน้องมีเงิน 50 บาท ใช้ไป 15 บาท และได้รับเงินเพิ่มอีก 20 บาท น้องจะมีเงินเหลือกี่บาท?",
            answer: "55",
            hint: "คำนวณตามลำดับ: 1. ลบเงินที่ใช้ 2. บวกเงินที่ได้รับเพิ่ม",
            timeLimit: 45,
            points: 200
        },
        {
            title: "ด่านที่ 3: คูณและหาร",
            question: "ถ้าน้องมีถุงขนม 5 ถุง แต่ละถุงมีขนม 8 ชิ้น และแบ่งให้เพื่อน 4 คนเท่าๆ กัน แต่ละคนจะได้ขนมคนละกี่ชิ้น?",
            answer: "10",
            hint: "1. คูณจำนวนถุงกับจำนวนขนมในแต่ละถุง 2. หารด้วยจำนวนเพื่อน",
            timeLimit: 60,
            points: 300
        },
        {
            title: "ด่านที่ 4: สมการและลำดับ",
            question: "ถ้า x + 5 = 12 และ y = x × 2 แล้ว y มีค่าเท่ากับเท่าไร?",
            answer: "14",
            hint: "1. หาค่า x จากสมการแรก 2. นำค่า x ไปคูณ 2 เพื่อหาค่า y",
            timeLimit: 90,
            points: 500
        }
    ];

    // ดึงความก้าวหน้าจาก localStorage เมื่อโหลดเกม
    useEffect(() => {
        // อัพเดทคะแนนและดาวจากข้อมูลที่บันทึกไว้
        if (totalStars) setTotalStars(totalStars);
        if (highestScore) {
            setHighestScore(highestScore);
            setScore(highestScore);
        }

        // ตั้งค่าเวลาสำหรับด่านปัจจุบัน
        const currentLevelData = levels[currentLevel - 1];
        setElapsedTime(0);
        setIsPlaying(true);
    }, []);

    // เมื่อเปลี่ยนด่าน
    useEffect(() => {
        if (currentLevel > 0) {
            setAnimating(true);
            const currentLevelData = levels[currentLevel - 1];
            setElapsedTime(0);
            setIsPlaying(true);
            setAnswer('');
            
            // จบอนิเมชันหลังจาก 500ms
            setTimeout(() => {
                setAnimating(false);
            }, 500);
        }
    }, [currentLevel]);

    // จัดการเวลาถอยหลัง
    useEffect(() => {
        if (!isPlaying) return;
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        setElapsedTime(0);
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        return () => {
            clearInterval(interval);
            setTimerInterval(null);
        };
    }, [isPlaying, currentLevel]);

    // จัดการเมื่อหมดเวลา
    const handleTimeout = () => {
        setIsPlaying(false);
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        addNotification({
            type: 'error',
            title: 'หมดเวลา!',
            message: 'ลองใหม่อีกครั้ง',
            duration: 3000
        });
        const currentLevelData = levels[currentLevel - 1];
        saveGameHistory(currentLevelData, answer || "(ไม่ได้ตอบ)", false, elapsedTime, 0, 0, null);
    };

    // คำนวณดาวจากเวลาที่ใช้จริง
    const calculateStars = (usedTime) => {
        if (usedTime <= 60) return 4;
        if (usedTime <= 120) return 3;
        if (usedTime <= 180) return 2;
        return 1;
    };

    // คำนวณคะแนนจากเวลาที่ใช้และความยากของด่าน
    const calculatePoints = (usedTime, totalTime, level, basePoints) => {
        // คะแนนเต็ม 100 คะแนน
        return 100;
    };

    // แสดงคำใบ้
    const showHint = () => {
        const currentLevelData = levels[currentLevel - 1];
        
        // ลดคะแนนเมื่อใช้คำใบ้ (ตัดคะแนน 10% ของคะแนนเต็มในด่านนั้น)
        const hintPenalty = Math.round(currentLevelData.points * 0.1);
        
        // ตรวจสอบว่าเคยใช้คำใบ้ในด่านนี้หรือยัง
        const hintUsed = localStorage.getItem(`mathPuzzle_hint_level_${currentLevel}`);
        
        if (!hintUsed) {
            // บันทึกว่าได้ใช้คำใบ้แล้ว
            localStorage.setItem(`mathPuzzle_hint_level_${currentLevel}`, 'true');
            
            // แจ้งเตือนเมื่อใช้คำใบ้ครั้งแรก
            addNotification({
                type: 'info',
                title: '🔍 คำใบ้สำหรับด่านที่ ' + currentLevel,
                message: `${currentLevelData.hint} (ถูกหัก ${hintPenalty} คะแนน)`,
                duration: 5000
            });
            
            // หักคะแนน
            setScore(prevScore => Math.max(0, prevScore - hintPenalty));
        } else {
            // กรณีที่เคยใช้คำใบ้แล้ว แค่แสดงคำใบ้โดยไม่หักคะแนนเพิ่ม
            addNotification({
                type: 'info',
                title: '🔍 คำใบ้สำหรับด่านที่ ' + currentLevel,
                message: currentLevelData.hint,
                duration: 5000
            });
        }
        
        // แสดงป๊อปอัพคำใบ้
        setShowHintPopup(true);
        
        // เพิ่มการสั่นของปุ่มคำใบ้เพื่อให้รู้ว่าได้กดใช้งานแล้ว
        const hintButton = document.querySelector('.hint-button');
        if (hintButton) {
            hintButton.classList.add('used');
            setTimeout(() => {
                hintButton.classList.remove('used');
            }, 1000);
        }
    };

    // จัดการเมื่อส่งคำตอบ
    const handleSubmit = (e) => {
        e.preventDefault();
        const currentLevelData = levels[currentLevel - 1];
        const isCorrect = answer === currentLevelData.answer;
        const usedTime = elapsedTime;
        
        if (isCorrect) {
            playSound('correct.mp3');
            playSound('achievement.mp3');
            if (timerInterval) clearInterval(timerInterval);
            setTimerInterval(null);
            // คำนวณคะแนนและดาวที่ได้
            const earnedPoints = calculatePoints(usedTime, currentLevelData.timeLimit, currentLevel, currentLevelData.points);
            const earnedStars = calculateStars(usedTime);
            const newScore = score + earnedPoints;
            setScore(newScore);
            setStars(earnedStars);
            setIsPlaying(false);
            // อัปเดตดาวแต่ละด่าน
            setStarsPerLevel(prev => ({
                ...prev,
                [currentLevel]: earnedStars
            }));
            // อัพเดทจำนวนดาวรวม (เฉพาะกรณีนี้เพื่อแสดงผลสะสม)
            const newTotalStars = Object.values({ ...starsPerLevel, [currentLevel]: earnedStars }).reduce((sum, s) => sum + s, 0);
            setTotalStars(newTotalStars);
            
            // อัพเดทคะแนนสูงสุด
            if (newScore > highestScore) {
                setHighestScore(newScore);
            }
            
            // แสดงการแจ้งเตือน
            addNotification({
                type: 'success',
                title: '🎉 ถูกต้อง!',
                message: `+${earnedPoints} คะแนน, ${earnedStars} ดาว (ความยาก: ${Math.round((1 + (currentLevel * 0.25)) * 100)}%)`,
                duration: 3000
            });
            
            // อัพเดทความก้าวหน้าเฉพาะเมื่อผ่านด่านที่สูงกว่าเดิม
            const newCompletedLevel = Math.max(completedLevels, currentLevel);
            setCompletedLevels(newCompletedLevel);
            
            // บันทึกความก้าวหน้า
            saveGameHistory(currentLevelData, answer, true, usedTime, earnedPoints, earnedStars, null);
            
            // ตรวจสอบว่าเป็นด่านสุดท้ายหรือไม่
            if (currentLevel < 4) {
                setTimeout(() => {
                    setCurrentLevel(prev => prev + 1);
                    setAnswer('');
                    setIsPlaying(true);
                }, 2000);
            } else {
                // จบเกม: บันทึกคะแนนรวมเพียงครั้งเดียว
                setGameCompleted(true);
                addNotification({
                    type: 'success',
                    title: '🏆 ยินดีด้วย!',
                    message: `คุณเล่นจบเกมแล้ว! คะแนนรวม: ${newScore} (${newTotalStars} ดาว)`,
                    duration: 5000
                });
                // เพิ่มบันทึกคะแนนรวม
                const student = JSON.parse(localStorage.getItem('student') || '{}');
                if (student.student_id) {
                    saveScoreToServer(student.student_id, 'mathPuzzle', newScore, newTotalStars);
                }
            } 
            setUsedTimePerLevel(prev => ({
                ...prev,
                [currentLevel]: usedTime
            }));
        } else {
            playSound('wrong.mp3');
            if (timerInterval) clearInterval(timerInterval);
            setTimerInterval(null);
            // ตอบผิด
            addNotification({
                type: 'error',
                title: '❌ ไม่ถูกต้อง',
                message: 'ลองอีกครั้ง',
                duration: 3000
            });
            
            // บันทึกประวัติการเล่น (กรณีตอบผิด)
            saveGameHistory(currentLevelData, answer, false, usedTime, 0, 0, null);
        }
    };

    // แสดงดาว
    const StarRating = ({ stars }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((index) => (
                    <span 
                        key={index} 
                        className={`star ${index <= stars ? 'filled' : 'empty'}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // ฟอร์แมตเวลา
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getCurrentLevel = () => levels[currentLevel - 1];

    // รีเซ็ตด่านปัจจุบัน
    const resetCurrentLevel = () => {
        const currentLevelData = levels[currentLevel - 1];
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        setElapsedTime(0);
        setIsPlaying(true);
        setAnswer('');
        addNotification({
            type: 'info',
            title: '🔄 รีเซ็ตด่าน',
            message: `เริ่มเล่นด่านที่ ${currentLevel} ใหม่`,
            duration: 3000
        });
    };

    // เพิ่มฟังก์ชันสำหรับจัดรูปแบบโจทย์คณิตศาสตร์
    const formatMathQuestion = (question) => {
        // แทนที่ตัวเลขด้วย span ที่มี class พิเศษ
        let formattedQuestion = question.replace(/(\d+(\.\d+)?)/g, '<span class="math-number">$1</span>');
        
        // แทนที่สูตรคณิตศาสตร์ด้วย span ที่มี class พิเศษ
        const mathFormulas = [
            'sin', 'cos', 'tan', 'log', '\\+', '\\-', '\\*', '\\/', '\\^', '=', '\\(', '\\)',
            'π', '√', 'Σ', 'a\\^2', 'x\\^2', '\\d+\\^\\d+', '\\w+\\^\\d+'
        ];
        
        const formulaPattern = new RegExp(`(${mathFormulas.join('|')})`, 'g');
        formattedQuestion = formattedQuestion.replace(formulaPattern, '<span class="math-formula">$1</span>');
        
        return formattedQuestion;
    };

    // บันทึกประวัติการเล่น
    const saveGameHistory = (levelData, userAnswer, isCorrect, usedTime, earnedPoints, earnedStars, studentId) => {
        if (!studentId) return;
        
        // สร้างข้อมูลประวัติการเล่น
        const historyEntry = {
            timestamp: new Date().toISOString(),
            level: currentLevel,
            levelTitle: levelData.title,
            question: levelData.question,
            userAnswer: userAnswer,
            correctAnswer: levelData.answer,
            isCorrect: isCorrect,
            timeLimit: levelData.timeLimit,
            timeUsed: levelData.timeLimit - usedTime,
            earnedPoints: isCorrect ? earnedPoints : 0,
            earnedStars: isCorrect ? earnedStars : 0,
            hints: localStorage.getItem(`mathPuzzle_hint_level_${currentLevel}_${studentId}`) === 'true'
        };

        // ดึงประวัติเดิม
        let gameHistory = JSON.parse(localStorage.getItem(`mathPuzzle_history_${studentId}`) || '[]');
        
        // เพิ่มประวัติใหม่
        gameHistory.push(historyEntry);
        
        // จำกัดประวัติไม่เกิน 100 รายการ
        if (gameHistory.length > 100) {
            gameHistory = gameHistory.slice(-100);
        }
        
        // บันทึกลง localStorage
        localStorage.setItem(`mathPuzzle_history_${studentId}`, JSON.stringify(gameHistory));
        
        // บันทึกสถิติรวม
        updateGameStats(isCorrect, earnedPoints, earnedStars, studentId);
    };

    // อัปเดตสถิติรวมของเกม
    const updateGameStats = (isCorrect, earnedPoints, earnedStars, studentId) => {
        if (!studentId) return;
        
        const statsKey = `mathPuzzle_stats_${studentId}`;
        const currentStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
        
        const newStats = {
            totalAttempts: (currentStats.totalAttempts || 0) + 1,
            correctAnswers: (currentStats.correctAnswers || 0) + (isCorrect ? 1 : 0),
            totalPoints: (currentStats.totalPoints || 0) + earnedPoints,
            totalStars: (currentStats.totalStars || 0) + earnedStars,
            lastPlayed: new Date().toISOString()
        };
        
        localStorage.setItem(statsKey, JSON.stringify(newStats));
    };

    const saveScoreToServer = async (studentId, gameType, score, stars) => {
        const formData = new FormData();
        formData.append('student_id', studentId);
        formData.append('game_type', gameType);
        formData.append('score', score);
        formData.append('stars', stars);

        try {
            const response = await fetch('http://mgt2.pnu.ac.th/kong/app-game/save_score.php', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!result.success) {
                console.error('บันทึกคะแนนล้มเหลว:', result.message);
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ:', error);
        }
    };

    const handleLevelComplete = () => {
        if (currentLevel > 4) return; // ป้องกันด่านเกิน
        
        // ดึงข้อมูลนักเรียน
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        const studentId = student.id;
        
        if (!studentId) {
            console.warn('ไม่พบรหัสนักเรียน ไม่สามารถบันทึกความก้าวหน้าได้');
            return;
        }

        const currentLevelData = levels[currentLevel - 1];
        const userAnswer = answer.trim();
        const isCorrect = userAnswer === currentLevelData.answer;
        const usedTime = elapsedTime;
        
        if (isCorrect) {
            playSound('correct.mp3');
            playSound('achievement.mp3');
            // คำนวณคะแนนตามเวลาที่เหลือ
            const timeBonus = Math.floor(usedTime / (currentLevelData.timeLimit / 10));
            const earnedPoints = currentLevelData.points + timeBonus;
            const newScore = score + earnedPoints;
            
            // คำนวณดาวที่ได้รับ (1-3 ดาว)
            const earnedStars = calculateStars(usedTime);
            const newStars = earnedStars;
            const newTotalStars = totalStars + earnedStars;
            
            // แสดงข้อความยินดี
            setModalContent({
                title: '🎉 ยินดีด้วย! คำตอบถูกต้อง',
                message: `คุณผ่านด่านที่ ${currentLevel} แล้ว!\nคะแนนที่ได้: ${earnedPoints} คะแนน\nดาว: ${'⭐'.repeat(earnedStars)}`
            });
            setIsModalOpen(true);
            
            // อัพเดทความก้าวหน้าเฉพาะเมื่อผ่านด่านที่สูงกว่าเดิม
            const newCompletedLevel = Math.max(completedLevels, currentLevel);
            setCompletedLevels(newCompletedLevel);
            
            // บันทึกความก้าวหน้าแยกตามรหัสนักเรียน
            saveGameHistory(currentLevelData, userAnswer, true, usedTime, earnedPoints, earnedStars, studentId);
            
            // เตรียมไปด่านถัดไป หรือจบเกม
            setScore(newScore);
            setStars(newStars);
            setTotalStars(newTotalStars);
            
            // คำนวณดาวของด่านนี้
            setStarsPerLevel(prev => ({
                ...prev,
                [currentLevel]: earnedStars
            }));
            
            if (currentLevel < 4) {
                // ไปด่านถัดไป
                setTimeout(() => {
                    setCurrentLevel(currentLevel + 1);
                    setAnswer('');
                    setElapsedTime(0);
                    setIsModalOpen(false);
                }, 3000);
            } else {
                // จบเกม
                setTimeout(() => {
                    setIsModalOpen(false);
                    
                    // บันทึกคะแนนลงเซิร์ฟเวอร์ (ถ้ามี) เมื่อเล่นจบเกม
                    const serverStudentId = student.student_id || studentId;
                    const finalTotalStars = Object.values({ ...starsPerLevel, [currentLevel]: earnedStars }).reduce((sum, s) => sum + s, 0);
                    saveScoreToServer(serverStudentId, 'mathPuzzle', newScore, finalTotalStars);
                    
                    // แสดงข้อความจบเกม
                    setModalContent({
                        title: '🏆 ยินดีด้วย! คุณชนะเกมแล้ว',
                        message: `คุณผ่านทั้ง 4 ด่านแล้ว!\nคะแนนรวม: ${newScore} คะแนน\nดาวทั้งหมด: ${finalTotalStars} ดาว`
                    });
                    setIsModalOpen(true);
                    
                    // หลังจากแสดงข้อความจบเกม
                    setTimeout(() => {
                        setIsModalOpen(false);
                    }, 5000);
                }, 3000);
            }
            playSound('level_complete.mp3');
        } else {
            playSound('wrong.mp3');
            // ตอบผิด
            // บันทึกประวัติการเล่น
            saveGameHistory(currentLevelData, userAnswer, false, usedTime, 0, 0, studentId);
            
            // แสดงข้อความเมื่อตอบผิด
            setModalContent({
                title: '❌ ไม่ถูกต้อง',
                message: 'ลองคิดอีกครั้ง หรือดูคำใบ้เพื่อช่วยในการแก้ปัญหา'
            });
            setIsModalOpen(true);
            
            // ปิดข้อความหลังจาก 2 วินาที
            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);
        }
    };

    const playSound = (file) => {
        const audio = new Audio(process.env.PUBLIC_URL + '/sounds/' + file);
        audio.play();
    };

    useEffect(() => {
        if (gameCompleted) {
            playSound('victory_music.mp3');
        }
    }, [gameCompleted]);

    return (
        <div className="math-puzzle">
            <div className={`game-header ${animating ? 'animate-fadein' : ''}`}>
                <h1>{getCurrentLevel().title}</h1>
                <div className="game-stats">
                    <div className="score-container">
                        <div className="score">คะแนน: {score}</div>
                        <div className="total-stars">ดาวสะสม: {totalStars}</div>
                    </div>
                    <div className={`timer ${elapsedTime > 60 ? 'timer-warning' : ''}`}>
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-text">{formatTime(elapsedTime)}</span>
                    </div>
                    <StarRating stars={stars} />
                </div>
            </div>

            <div className={`puzzle-container ${animating ? 'animate-slidein' : ''}`}>
                {isPlaying ? (
                    <>
                        <div className="level-info">
                            <div className="question" 
                                 dangerouslySetInnerHTML={{ __html: formatMathQuestion(getCurrentLevel().question) }}>
                            </div>
                        </div>

                        <form onSubmit={(e) => { playSound('click.mp3'); handleSubmit(e); }} className="answer-form">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="ใส่คำตอบ"
                                autoFocus
                                className="answer-input"
                            />
                            <div className="button-group">
                                <button type="submit" className="submit-button" onClick={() => playSound('click.mp3')}>ตอบ</button>
                                <button type="button" className="hint-button" onClick={() => { playSound('button.mp3'); showHint(); }}>
                                    <span className="hint-icon">💡</span> คำใบ้
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="game-over">
                        {gameCompleted ? (
                            <div className="completion-message">
                                <h2>🎊 ยินดีด้วย! คุณชนะเกมแล้ว 🎊</h2>
                                <div className="final-score">
                                    <p>คะแนนรวม: {score}</p>
                                    <div className="stars-container">
                                        <StarRating stars={stars} />
                                    </div>
                                    <div className="used-time-summary" style={{ marginTop: 16 }}>
                                        <h4>เวลาที่ใช้แต่ละด่าน:</h4>
                                        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                                            {Object.entries(usedTimePerLevel).map(([level, time]) => (
                                                <li key={level}>ด่าน {level}: {time} วินาที</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="game-over-buttons">
                                    <button 
                                        className="replay-button"
                                        onClick={() => {
                                            playSound('button.mp3');
                                            setCurrentLevel(1);
                                            setScore(0);
                                            setStars(0);
                                            setAnswer('');
                                            setIsPlaying(true);
                                            setGameCompleted(false);
                                            setElapsedTime(0);
                                        }}
                                    >
                                        เล่นใหม่
                                    </button>
                                    <button 
                                        className="home-button"
                                        onClick={() => {
                                            playSound('button.mp3');
                                            navigate('/student-dashboard');
                                        }}
                                    >
                                        กลับสู่หน้าหลัก
                                    </button>
                                </div>
                            </div>
                        ) : elapsedTime === 0 ? (
                            <>
                                <h2>⏰ หมดเวลา!</h2>
                                <button 
                                    className="retry-button"
                                    onClick={() => {
                                        const currentLevelData = levels[currentLevel - 1];
                                        setElapsedTime(currentLevelData.timeLimit);
                                        setIsPlaying(true);
                                    }}
                                >
                                    ลองใหม่
                                </button>
                            </>
                        ) : (
                            <div className="loading">
                                <h2>รอสักครู่...</h2>
                                <div className="loading-spinner"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ส่วนควบคุมเกม */}
            <div className="game-controls">
                <button 
                    className="level-select-button"
                    onClick={() => {
                        playSound('button.mp3');
                        setShowLevelSelector(true);
                    }}
                >
                    <span className="level-icon">🎮</span> เลือกด่าน
                </button>
                
                <button 
                    className="reset-button"
                    onClick={() => {
                        playSound('button.mp3');
                        resetCurrentLevel();
                    }}
                >
                    <span className="reset-icon">🔄</span> รีเซ็ตด่าน
                </button>

                <button 
                    className="home-button"
                    onClick={() => {
                        playSound('button.mp3');
                        navigate('/student-dashboard');
                    }}
                >
                    <span className="home-icon">🏠</span> กลับหน้าหลัก
                </button>
            </div>

            {/* แสดงป๊อปอัพคำใบ้ */}
            {showHintPopup && (
                <HintPopup 
                    hint={levels[currentLevel - 1].hint} 
                    onClose={() => setShowHintPopup(false)}
                    levelNumber={currentLevel}
                />
            )}

            {/* แสดงป๊อปอัพเลือกด่าน */}
            {showLevelSelector && (
                <LevelSelector 
                    levels={levels}
                    currentLevel={currentLevel}
                    setCurrentLevel={setCurrentLevel}
                    completedLevels={completedLevels}
                    onClose={() => setShowLevelSelector(false)}
                />
            )}

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{modalContent.title}</h2>
                        <p>{modalContent.message}</p>
                        {modalContent.title.includes('ถูกต้อง') && (
                            <p style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                เวลาที่ใช้: {usedTimePerLevel[currentLevel] || 0} วินาที
                            </p>
                        )}
                        <button 
                            className="close-button"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MathPuzzle;