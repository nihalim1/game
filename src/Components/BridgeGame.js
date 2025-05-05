import React, { useState, useEffect } from 'react';
import './BridgeGame.css';
import { useNotification } from '../contexts/NotificationContext';

import { useNavigate } from 'react-router-dom';
import { calculateStarsByTime, saveLevelStars } from '../utils/starRating';

const BridgeGame = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    
    // สถานะของเกม
    const [currentLevel, setCurrentLevel] = useState(1);
    const [budget, setBudget] = useState(1000);
    const [score, setScore] = useState(0);
    const [bridgeParts, setBridgeParts] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState(null);
    const [gameCompleted, setGameCompleted] = useState(false);
    
    // เพิ่มตัวแปรสำหรับระบบเวลาและดาว
    const [timeLeft, setTimeLeft] = useState(300); // 5 นาทีสำหรับแต่ละด่าน
    const [isPlaying, setIsPlaying] = useState(false);
    const [stars, setStars] = useState(0);
    const [starsPerLevel, setStarsPerLevel] = useState({}); // เพิ่ม state สำหรับเก็บดาวแต่ละด่าน
    
    // เพิ่ม state สำหรับจับเวลานับขึ้น
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    
    // วัสดุสำหรับสร้างสะพาน
    const materials = [
        { id: 1, name: "ไม้", strength: 50, cost: 100, availableFrom: 1, description: "วัสดุพื้นฐาน ราคาถูก แข็งแรงพอใช้" },
        { id: 2, name: "อิฐ", strength: 120, cost: 200, availableFrom: 1, description: "แข็งแรงปานกลาง ทนน้ำได้ดีพอสมควร" },
        { id: 3, name: "เหล็ก", strength: 200, cost: 300, availableFrom: 2, description: "แข็งแรงสูง ทนลมได้ดี" },
        { id: 4, name: "คอนกรีต", strength: 250, cost: 350, availableFrom: 2, description: "แข็งแรงสูง ทนต่อน้ำได้ดี" },
        { id: 5, name: "เหล็กกล้า", strength: 300, cost: 450, availableFrom: 3, description: "แข็งแรงมาก ทนทานต่อแรงลมและน้ำ" },
        { id: 6, name: "เหล็กเสริมคอนกรีต", strength: 350, cost: 500, availableFrom: 3, description: "แข็งแรงมาก ทนต่อแรงลม น้ำ และแรงกดดัน" },
        { id: 7, name: "คอมโพสิต", strength: 400, cost: 650, availableFrom: 4, description: "น้ำหนักเบา แข็งแรงมาก ทนต่อแรงลมและความร้อน" },
        { id: 8, name: "ไทเทเนียม", strength: 450, cost: 800, availableFrom: 4, description: "แข็งแรงสูงมาก ทนสารเคมีและความร้อน" }
    ];

    // ระดับความยากของแต่ละด่าน
    const levels = [
        {
            id: 1,
            name: "สะพานข้ามลำธาร",
            length: 4,
            requiredStrength: 250,
            budget: 1000,
            description: "สร้างสะพานข้ามลำธารขนาดเล็ก เหมาะสำหรับคนเดินข้าม",
            wind: 0,
            water: 10,
            specialConditions: "ไม่มีเงื่อนไขพิเศษ",
            timeLimit: 300 // 5 นาที
        },
        {
            id: 2,
            name: "สะพานเชื่อมหมู่บ้าน",
            length: 6,
            requiredStrength: 500,
            budget: 1500,
            description: "สร้างสะพานเชื่อมระหว่างสองหมู่บ้าน สามารถรองรับรถเล็กได้",
            wind: 20,
            water: 20,
            specialConditions: "ลมพัดเบาๆ",
            timeLimit: 360 // 6 นาที
        },
        {
            id: 3,
            name: "สะพานข้ามแม่น้ำ",
            length: 8,
            requiredStrength: 750,
            budget: 2000,
            description: "สะพานข้ามแม่น้ำขนาดกลาง ต้องรองรับน้ำหนักรถได้",
            wind: 30,
            water: 40,
            specialConditions: "กระแสน้ำไหลเชี่ยว",
            timeLimit: 420 // 7 นาที
        },
        {
            id: 4,
            name: "สะพานข้ามหุบเขา",
            length: 10,
            requiredStrength: 1000,
            budget: 2500,
            description: "สะพานข้ามหุบเขาที่มีความลึก ต้องทนต่อแรงลมสูง",
            wind: 50,
            water: 0,
            specialConditions: "ลมแรง พื้นที่สูง",
            timeLimit: 480 // 8 นาที
        }
    ];

    // โหลดด่านปัจจุบัน
    useEffect(() => {
        initializeLevel(currentLevel);
    }, [currentLevel]);

    // เริ่มต้นระดับ
    const initializeLevel = (level) => {
        const levelData = levels[level - 1];
        setBudget(levelData.budget);
        setBridgeParts([]);
        setSimulationResult(null);
        setIsSimulating(false);
        setTimeLeft(levelData.timeLimit);
        setIsPlaying(true);
        setStars(0);
    };
    
    // จัดการเวลาถอยหลัง
    useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying]);

    // useEffect สำหรับเริ่มจับเวลานับขึ้นเมื่อเริ่มด่าน
    useEffect(() => {
        if (!isPlaying) return;
        setElapsedTime(0);
        if (timerInterval) clearInterval(timerInterval);
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
            message: 'คุณไม่สามารถสร้างสะพานให้เสร็จได้ทันเวลา'
        });
        // บันทึกประวัติกรณีหมดเวลา
        const currentLevelData = levels[currentLevel - 1];
        saveGameHistory(currentLevelData, false, 0, 0, 0);
    };

    // ฟอร์แมตเวลา
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // เพิ่มชิ้นส่วนสะพาน
    const addBridgePart = (material) => {
        playSound('click.mp3');
        if (budget < material.cost) {
            addNotification({
                type: 'warning',
                title: 'งบประมาณไม่เพียงพอ',
                message: `คุณต้องการ ${material.cost} บาท แต่มีเพียง ${budget} บาท`
            });
            return;
        }

        if (material.availableFrom > currentLevel) {
            addNotification({
                type: 'warning',
                title: 'วัสดุยังไม่พร้อมใช้งาน',
                message: `วัสดุนี้จะใช้ได้ในด่านที่ ${material.availableFrom} เป็นต้นไป`
            });
            return;
        }

        setBridgeParts([...bridgeParts, material]);
        setBudget(budget - material.cost);
    };

    // ลบชิ้นส่วนสะพาน
    const removeBridgePart = (index) => {
        playSound('button.mp3');
        const newParts = [...bridgeParts];
        const removedPart = newParts.splice(index, 1)[0];
        setBridgeParts(newParts);
        setBudget(budget + removedPart.cost);
    };

    // คำนวณความแข็งแรงของสะพาน
    const calculateBridgeStrength = () => {
        if (bridgeParts.length === 0) return 0;
        
        const currentLevelData = levels[currentLevel - 1];
        const totalStrength = bridgeParts.reduce((sum, part) => sum + part.strength, 0);
        
        // คำนวณผลกระทบจากสภาพแวดล้อม
        let environmentalImpact = 1.0;
        
        if (currentLevelData.wind > 0) {
            environmentalImpact -= (currentLevelData.wind / 100) * 0.3; // ลมลดความแข็งแรงได้สูงสุด 30%
        }
        
        if (currentLevelData.water > 0) {
            environmentalImpact -= (currentLevelData.water / 100) * 0.3; // น้ำลดความแข็งแรงได้สูงสุด 30%
        }
        
        if (currentLevelData.heat > 0) {
            environmentalImpact -= (currentLevelData.heat / 100) * 0.2; // ความร้อนลดความแข็งแรงได้สูงสุด 20%
        }
        
        if (currentLevelData.earthquake > 0) {
            environmentalImpact -= (currentLevelData.earthquake / 100) * 0.4; // แผ่นดินไหวลดความแข็งแรงได้สูงสุด 40%
        }
        
        if (currentLevelData.salt > 0) {
            environmentalImpact -= (currentLevelData.salt / 100) * 0.25; // น้ำเค็มลดความแข็งแรงได้สูงสุด 25%
        }
        
        if (currentLevelData.vibration > 0) {
            environmentalImpact -= (currentLevelData.vibration / 100) * 0.2; // การสั่นสะเทือนลดความแข็งแรงได้สูงสุด 20%
        }
        
        // ไม่ให้ผลกระทบน้อยกว่า 40% ของความแข็งแรงเดิม
        environmentalImpact = Math.max(0.4, environmentalImpact);
        
        return Math.round(totalStrength * environmentalImpact);
    };

    // คำนวณคะแนน
    const calculateScore = () => {
        const currentLevelData = levels[currentLevel - 1];
        const baseScore = 100; // คะแนนเต็ม 100 คะแนน
        const timeBonus = Math.round((timeLeft / currentLevelData.timeLimit) * baseScore * 0.3); // โบนัสจากเวลาที่เหลือ 30%
        const budgetBonus = Math.round((budget / currentLevelData.budget) * baseScore * 0.2); // โบนัสจากงบประมาณที่เหลือ 20%
        
        return Math.min(100, baseScore + timeBonus + budgetBonus);
    };

    // คำนวณดาวจากเวลาที่ใช้จริง
    const calculateStars = (usedTime) => {
        if (usedTime <= 60) return 4;
        if (usedTime <= 120) return 3;
        if (usedTime <= 180) return 2;
        return 1;
    };

    // จำลองการทดสอบสะพาน
    const simulateBridge = () => {
        playSound('button.mp3');
        if (bridgeParts.length === 0) {
            addNotification({
                type: 'error',
                title: 'ไม่สามารถทดสอบได้',
                message: 'คุณยังไม่ได้สร้างสะพาน'
            });
            return;
        }
        setIsSimulating(true);
        // จำลองการทดสอบใช้เวลา 3 วินาที
        setTimeout(() => {
            const currentLevelData = levels[currentLevel - 1];
            const bridgeStrength = calculateBridgeStrength();
            const success = bridgeStrength >= currentLevelData.requiredStrength;
            const usedTime = elapsedTime;
            if (timerInterval) clearInterval(timerInterval);
            setTimerInterval(null);
            if (success) {
                // คำนวณคะแนน
                const earnedScore = calculateScore();
                const earnedStars = calculateStars(usedTime);
                // บันทึกดาวสำหรับด่านนี้
                setStarsPerLevel(prev => ({
                    ...prev,
                    [currentLevel]: earnedStars
                }));
                setStars(earnedStars);
                setScore(prev => prev + earnedScore);
                setSimulationResult({
                    success: true,
                    message: `สำเร็จ! สะพานของคุณแข็งแรงพอ (${bridgeStrength}/${currentLevelData.requiredStrength})`,
                    stars: earnedStars,
                    score: earnedScore
                });
                // บันทึกความก้าวหน้า
                saveGameHistory(currentLevelData, true, currentLevelData.timeLimit - usedTime, earnedScore, earnedStars);
                // หยุดการนับเวลา
                setIsPlaying(false);
                playSound('level_complete.mp3');
            } else {
                setSimulationResult({
                    success: false,
                    message: `ล้มเหลว! สะพานของคุณไม่แข็งแรงพอ (${bridgeStrength}/${currentLevelData.requiredStrength})`,
                    stars: 0,
                    score: 0
                });
                // บันทึกประวัติการเล่น
                saveGameHistory(currentLevelData, false, currentLevelData.timeLimit - usedTime, 0, 0);
                playSound('wrong.mp3');
            }
            setIsSimulating(false);
        }, 3000);
    };

    // ไปยังด่านถัดไป
    const goToNextLevel = () => {
        playSound('click.mp3');
        if (currentLevel < 4) {
            setCurrentLevel(prev => prev + 1);
        } else {
            setGameCompleted(true);
            
            // คำนวณดาวรวมทั้งหมด
            const totalStars = Object.values(starsPerLevel).reduce((sum, stars) => sum + stars, 0);
            
            addNotification({
                type: 'success',
                title: 'ยินดีด้วย!',
                message: `คุณผ่านเกมสร้างสะพานครบทุกด่านแล้ว! ได้ดาวรวมทั้งหมด ${totalStars} ดาว`
            });
            
            // บันทึกคะแนนรวม
            const student = JSON.parse(localStorage.getItem('student') || '{}');
            if (student.student_id) {
                saveScoreToServer(student.student_id, 'bridgeGame', score, totalStars);
            }
            if (currentLevel >= 4) {
                playSound('victory_music.mp3');
            }
        }
    };

    // รีเซ็ตด่านปัจจุบัน
    const resetLevel = () => {
        playSound('button.mp3');
        setElapsedTime(0);
        initializeLevel(currentLevel);
    };

    // ข้อมูลวัสดุ
    const getMaterialInfo = (material) => {
        return `${material.name}: ความแข็งแรง ${material.strength}, ราคา ${material.cost} บาท`;
    };

    // ข้อมูลสภาพแวดล้อม
    const getEnvironmentInfo = () => {
        const currentLevelData = levels[currentLevel - 1];
        let info = [];
        
        if (currentLevelData.wind > 0) {
            info.push(`แรงลม: ${currentLevelData.wind}%`);
        }
        
        if (currentLevelData.water > 0) {
            info.push(`แรงน้ำ: ${currentLevelData.water}%`);
        }
        
        if (currentLevelData.heat > 0) {
            info.push(`ความร้อน: ${currentLevelData.heat}%`);
        }
        
        if (currentLevelData.earthquake > 0) {
            info.push(`แผ่นดินไหว: ${currentLevelData.earthquake}%`);
        }
        
        if (currentLevelData.salt > 0) {
            info.push(`น้ำเค็ม: ${currentLevelData.salt}%`);
        }
        
        if (currentLevelData.vibration > 0) {
            info.push(`การสั่นสะเทือน: ${currentLevelData.vibration}%`);
        }
        
        return info.join(', ');
    };

    // กลับไปยังหน้าหลัก
    const goToHome = () => {
        playSound('button.mp3');
        navigate('/student-dashboard');
    };

    // บันทึกประวัติการเล่น
    const saveGameHistory = (levelData, isSuccess, timeRemaining, earnedScore, earnedStars) => {
        // ดึงข้อมูลนักเรียน
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        const studentId = student.id;
        
        if (!studentId) {
            console.warn('ไม่พบรหัสนักเรียน ไม่สามารถบันทึกประวัติการเล่นได้');
            return;
        }
        
        // สร้างข้อมูลประวัติการเล่น
        const historyEntry = {
            timestamp: new Date().toISOString(),
            level: currentLevel,
            levelName: levelData.name,
            isSuccess: isSuccess,
            timeLimit: levelData.timeLimit,
            timeUsed: levelData.timeLimit - timeRemaining,
            budgetLimit: levelData.budget, 
            budgetUsed: levelData.budget - budget,
            bridgeParts: bridgeParts.map(part => part.name).join(', '),
            earnedScore: earnedScore,
            earnedStars: earnedStars
        };

        // ดึงประวัติเดิม
        let gameHistory = JSON.parse(localStorage.getItem(`bridgeGame_history_${studentId}`) || '[]');
        
        // เพิ่มประวัติใหม่
        gameHistory.push(historyEntry);
        
        // จำกัดประวัติไม่เกิน 100 รายการ
        if (gameHistory.length > 100) {
            gameHistory = gameHistory.slice(-100);
        }
        
        // บันทึกลง localStorage
        localStorage.setItem(`bridgeGame_history_${studentId}`, JSON.stringify(gameHistory));
        
        // บันทึกสถิติรวม
        updateGameStats(isSuccess, earnedScore, earnedStars, studentId);
        
        // บันทึกความก้าวหน้า
        if (isSuccess) {
            // บันทึกคะแนนลงเซิร์ฟเวอร์ (ถ้ามี) เมื่อเล่นจบเกม
            if (currentLevel === 4 && isSuccess) {
                const serverStudentId = student.student_id || studentId;
                const totalStars = Object.values(starsPerLevel).reduce((sum, stars) => sum + stars, 0);
                saveScoreToServer(serverStudentId, 'bridgeGame', score + earnedScore, totalStars);
            }
        }
    };

    // อัพเดทสถิติรวมของเกม
    const updateGameStats = (isSuccess, earnedScore, earnedStars, studentId) => {
        if (!studentId) return;
        
        const statsKey = `bridgeGame_stats_${studentId}`;
        const currentStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
        
        const newStats = {
            totalGames: (currentStats.totalGames || 0) + 1,
            wins: (currentStats.wins || 0) + (isSuccess ? 1 : 0),
            totalScore: (currentStats.totalScore || 0) + earnedScore,
            totalStars: (currentStats.totalStars || 0) + earnedStars,
            lastPlayed: new Date().toISOString()
        };
        
        localStorage.setItem(statsKey, JSON.stringify(newStats));
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

    const saveScoreToServer = async (studentId, gameType, score, totalStars) => {
        const formData = new FormData();
        formData.append('student_id', studentId);
        formData.append('game_type', gameType);
        formData.append('score', score);
        formData.append('stars', totalStars);

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

    // เพิ่มฟังก์ชันเล่นเสียง
    const playSound = (file) => {
        const audio = new Audio(process.env.PUBLIC_URL + '/sounds/' + file);
        audio.play();
    };

    return (
        <div className="bridge-game">
            {/* Header */}
            <div className="game-header">
                <h1>เกมสร้างสะพาน <span style={{fontWeight:400, fontSize:'1.1rem', color:'#1976d2'}}>– {levels[currentLevel - 1].name}</span></h1>
                <div className="game-stats">
                    <div className="score">คะแนน: {score}</div>
                    <div className="timer-display" style={{ marginLeft: 16, fontWeight: 'bold', color: elapsedTime > 60 ? '#d32f2f' : '#1976d2', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 4 }}>⏱️</span> {formatTime(elapsedTime)}
                    </div>
                    <StarRating stars={stars} />
                </div>
            </div>

            {/* Level Info */}
            <div className="level-info" style={{marginBottom: 18}}>
                <h3>ด่านที่ {currentLevel}: {levels[currentLevel - 1].name}</h3>
                <div style={{display:'flex', flexWrap:'wrap', gap:16}}>
                    <div style={{minWidth:180, flex:1}}>
                        <p><b>รายละเอียด:</b> {levels[currentLevel - 1].description}</p>
                        <p><b>ความยาวสะพาน:</b> {levels[currentLevel - 1].length} หน่วย</p>
                        <p><b>ความแข็งแรงที่ต้องการ:</b> {levels[currentLevel - 1].requiredStrength}</p>
                        <p><b>งบประมาณเริ่มต้น:</b> {levels[currentLevel - 1].budget} บาท</p>
                    </div>
                    <div style={{minWidth:180, flex:1}}>
                        <p><b>สภาพแวดล้อม:</b> {getEnvironmentInfo() || '-'}</p>
                        <p><b>เงื่อนไขพิเศษ:</b> {levels[currentLevel - 1].specialConditions}</p>
                    </div>
                </div>
            </div>

            {/* Bridge Area */}
            <div className="bridge-building-area">
                <h3>พื้นที่สร้างสะพาน</h3>
                <div className="bridge-visual">
                    {bridgeParts.length > 0 ? (
                        <div className="bridge-parts">
                            {bridgeParts.map((part, index) => (
                                <div key={index} className="bridge-part" onClick={() => removeBridgePart(index)}>
                                    <div className="part-name">{part.name}</div>
                                    <div className="part-strength">ความแข็งแรง: {part.strength}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-bridge">
                            <p>เลือกวัสดุจากรายการด้านล่างเพื่อสร้างสะพาน</p>
                        </div>
                    )}
                </div>
                <div className="bridge-stats">
                    <div className="budget">งบประมาณคงเหลือ: {budget} บาท</div>
                    <div className="strength">ความแข็งแรงปัจจุบัน: {calculateBridgeStrength()} / {levels[currentLevel - 1].requiredStrength}</div>
                </div>
                <div className="bridge-controls">
                    <button 
                        className="simulate-button" 
                        onClick={simulateBridge} 
                        disabled={isSimulating || bridgeParts.length === 0 || !isPlaying}
                    >
                        {isSimulating ? 'กำลังทดสอบ...' : 'ทดสอบสะพาน'}
                    </button>
                    <button className="reset-button" onClick={resetLevel} disabled={isSimulating}>
                        เริ่มใหม่
                    </button>
                </div>
                {simulationResult && (
                    <div className={`simulation-result ${simulationResult.success ? 'success' : 'failure'}`}>
                        <h3>{simulationResult.success ? 'ทดสอบสำเร็จ!' : 'ทดสอบล้มเหลว'}</h3>
                        <p>{simulationResult.message}</p>
                        {simulationResult.success && (
                            <>
                                <p>คะแนนที่ได้: +{simulationResult.score}</p>
                                <div className="stars-earned">
                                    <StarRating stars={simulationResult.stars} />
                                </div>
                                <button onClick={goToNextLevel} style={{marginTop:8}}>
                                    {currentLevel < levels.length ? 'ไปด่านต่อไป' : 'จบเกม'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Materials List */}
            <div className="materials-selection">
                <h3>วัสดุสำหรับสร้างสะพาน</h3>
                <div className="materials-list">
                    {materials.filter(m => m.availableFrom <= currentLevel).map(material => (
                        <div 
                            key={material.id}
                            className={`material-item ${budget < material.cost ? 'disabled' : ''}`}
                            onClick={() => addBridgePart(material)}
                        >
                            <div className="material-name">{material.name}</div>
                            <div className="material-details">
                                <span>ความแข็งแรง: {material.strength}</span>
                                <span>ราคา: {material.cost} บาท</span>
                            </div>
                            <div className="material-description">{material.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="game-footer">
                <button className="home-button" onClick={goToHome}>
                    กลับหน้าหลัก
                </button>
            </div>
        </div>
    );
};

export default BridgeGame;