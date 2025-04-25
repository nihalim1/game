import React, { useState, useEffect } from 'react';
import './BridgeGame.css';
import { useNotification } from '../contexts/NotificationContext';
import { saveGameProgress, getGameProgress } from '../utils/gameProgress';
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
    
    // วัสดุสำหรับสร้างสะพาน
    const materials = [
        { id: 1, name: "ไม้", strength: 50, cost: 100, availableFrom: 1, description: "วัสดุพื้นฐาน ราคาถูก แข็งแรงพอใช้" },
        { id: 2, name: "อิฐ", strength: 120, cost: 200, availableFrom: 1, description: "แข็งแรงปานกลาง ทนน้ำได้ดีพอสมควร" },
        { id: 3, name: "เหล็ก", strength: 200, cost: 300, availableFrom: 2, description: "แข็งแรงสูง ทนลมได้ดี" },
        { id: 4, name: "คอนกรีต", strength: 250, cost: 350, availableFrom: 3, description: "แข็งแรงสูง ทนต่อน้ำได้ดี" },
        { id: 5, name: "เหล็กกล้า", strength: 300, cost: 450, availableFrom: 4, description: "แข็งแรงมาก ทนทานต่อแรงลมและน้ำ" },
        { id: 6, name: "เหล็กเสริมคอนกรีต", strength: 350, cost: 500, availableFrom: 5, description: "แข็งแรงมาก ทนต่อแรงลม น้ำ และแรงกดดัน" },
        { id: 7, name: "คอมโพสิต", strength: 400, cost: 650, availableFrom: 6, description: "น้ำหนักเบา แข็งแรงมาก ทนต่อแรงลมและความร้อน" },
        { id: 8, name: "ไทเทเนียม", strength: 450, cost: 800, availableFrom: 7, description: "แข็งแรงสูงมาก ทนสารเคมีและความร้อน" },
        { id: 9, name: "คาร์บอนไฟเบอร์", strength: 500, cost: 900, availableFrom: 8, description: "น้ำหนักเบามาก แข็งแรงสูง ทนทุกสภาพ" },
        { id: 10, name: "วัสดุนาโน", strength: 600, cost: 1000, availableFrom: 9, description: "เทคโนโลยีล้ำสมัย แข็งแรงที่สุด ทนทุกสภาพแวดล้อม" }
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
        },
        {
            id: 5,
            name: "สะพานในเขตฝนตกหนัก",
            length: 8,
            requiredStrength: 1200,
            budget: 3000,
            description: "สะพานในพื้นที่ที่มีฝนตกหนัก ต้องทนต่อน้ำและความชื้น",
            wind: 30,
            water: 70,
            specialConditions: "ฝนตกหนัก น้ำท่วมบ่อย",
            timeLimit: 480 // 8 นาที
        },
        {
            id: 6,
            name: "สะพานในเขตร้อน",
            length: 10,
            requiredStrength: 1300,
            budget: 3200,
            description: "สะพานในพื้นที่อากาศร้อนจัด ต้องทนความร้อนสูง",
            wind: 20,
            water: 30,
            heat: 80,
            specialConditions: "อุณหภูมิสูงมาก วัสดุต้องทนความร้อน",
            timeLimit: 540 // 9 นาที
        },
        {
            id: 7,
            name: "สะพานข้ามทะเล",
            length: 12,
            requiredStrength: 1600,
            budget: 3800,
            description: "สะพานข้ามทะเล ต้องทนต่อน้ำเค็มและคลื่นลม",
            wind: 70,
            water: 60,
            salt: 90,
            specialConditions: "น้ำเค็ม คลื่นลมแรง ต้องทนต่อการกัดกร่อน",
            timeLimit: 600 // 10 นาที
        },
        {
            id: 8,
            name: "สะพานแขวน",
            length: 14,
            requiredStrength: 1800,
            budget: 4200,
            description: "สะพานแขวนขนาดใหญ่ รองรับการจราจรหนาแน่น",
            wind: 80,
            water: 40,
            vibration: 70,
            specialConditions: "ต้องทนต่อการสั่นสะเทือนจากการจราจร และลมพายุ",
            timeLimit: 600 // 10 นาที
        },
        {
            id: 9,
            name: "สะพานในเขตแผ่นดินไหว",
            length: 12,
            requiredStrength: 2000,
            budget: 4500,
            description: "สะพานในพื้นที่เสี่ยงแผ่นดินไหว ต้องออกแบบพิเศษ",
            wind: 40,
            water: 50,
            earthquake: 90,
            specialConditions: "พื้นที่เสี่ยงแผ่นดินไหว ต้องทนการสั่นสะเทือนรุนแรง",
            timeLimit: 660 // 11 นาที
        },
        {
            id: 10,
            name: "สะพานข้ามภูเขาไฟ",
            length: 10,
            requiredStrength: 2500,
            budget: 5000,
            description: "สะพานข้ามพื้นที่ใกล้ภูเขาไฟ ท้าทายที่สุด",
            wind: 60,
            water: 20,
            heat: 100,
            earthquake: 60,
            specialConditions: "ความร้อนสูงมาก แก๊สพิษ แผ่นดินไหวเป็นครั้งคราว",
            timeLimit: 720 // 12 นาที
        }
    ];

    // โหลดด่านปัจจุบัน
    useEffect(() => {
        const progress = getGameProgress('bridgeGame');
        if (progress.completedLevels > 0) {
            const nextLevel = Math.min(progress.completedLevels + 1, levels.length);
            setCurrentLevel(nextLevel);
        }
        
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

    // จัดการเมื่อหมดเวลา
    const handleTimeout = () => {
        setIsPlaying(false);
        
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

    // จำลองการทดสอบสะพาน
    const simulateBridge = () => {
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
            
            if (success) {
                // คำนวณดาวจากเวลาที่เหลือ
                const currentTimeLeft = timeLeft;
                const earnedStars = calculateStarsByTime(currentLevelData.timeLimit - currentTimeLeft, currentLevelData.timeLimit);
                setStars(earnedStars);
                
                // บันทึกดาวสำหรับด่านนี้
                saveLevelStars('bridgeGame', currentLevel, earnedStars);
                
                // เก็บคะแนนและบันทึกความก้าวหน้า
                const earnedScore = calculateScore();
                setScore(prev => prev + earnedScore);
                
                setSimulationResult({
                    success: true,
                    message: `สำเร็จ! สะพานของคุณแข็งแรงพอ (${bridgeStrength}/${currentLevelData.requiredStrength})`,
                    stars: earnedStars,
                    score: earnedScore
                });
                
                // บันทึกความก้าวหน้า
                saveGameProgress('bridgeGame', {
                    completedLevels: currentLevel,
                    highestScore: Math.max(getGameProgress('bridgeGame').highestScore || 0, score + earnedScore)
                });
                
                // บันทึกประวัติการเล่น
                saveGameHistory(currentLevelData, true, currentTimeLeft, earnedScore, earnedStars);
                
                // หยุดการนับเวลา
                setIsPlaying(false);
            } else {
                setSimulationResult({
                    success: false,
                    message: `ล้มเหลว! สะพานของคุณไม่แข็งแรงพอ (${bridgeStrength}/${currentLevelData.requiredStrength})`,
                    stars: 0,
                    score: 0
                });
                
                // บันทึกประวัติการเล่น
                saveGameHistory(currentLevelData, false, timeLeft, 0, 0);
            }
            
            setIsSimulating(false);
        }, 3000);
    };

    // คำนวณคะแนน
    const calculateScore = () => {
        const currentLevelData = levels[currentLevel - 1];
        const baseScore = currentLevelData.requiredStrength; // คะแนนพื้นฐานเท่ากับความแข็งแรงที่ต้องการ
        const timeBonus = Math.round((timeLeft / currentLevelData.timeLimit) * baseScore * 0.5); // โบนัสจากเวลาที่เหลือ
        const budgetBonus = Math.round((budget / currentLevelData.budget) * baseScore * 0.3); // โบนัสจากงบประมาณที่เหลือ
        
        return baseScore + timeBonus + budgetBonus;
    };

    // ไปยังด่านถัดไป
    const goToNextLevel = () => {
        if (currentLevel < levels.length) {
            setCurrentLevel(prev => prev + 1);
        } else {
            setGameCompleted(true);
            addNotification({
                type: 'success',
                title: 'ยินดีด้วย!',
                message: 'คุณผ่านเกมสร้างสะพานครบทุกด่านแล้ว!'
            });
        }
    };

    // รีเซ็ตด่านปัจจุบัน
    const resetLevel = () => {
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
        navigate('/student-dashboard');
    };

    // บันทึกประวัติการเล่น
    const saveGameHistory = (levelData, isSuccess, timeRemaining, earnedScore, earnedStars) => {
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
        let gameHistory = JSON.parse(localStorage.getItem('bridgeGame_history') || '[]');
        
        // เพิ่มประวัติใหม่
        gameHistory.push(historyEntry);
        
        // จำกัดประวัติไม่เกิน 100 รายการ
        if (gameHistory.length > 100) {
            gameHistory = gameHistory.slice(-100);
        }
        
        // บันทึกลง localStorage
        localStorage.setItem('bridgeGame_history', JSON.stringify(gameHistory));
        
        // บันทึกสถิติรวม
        updateGameStats(isSuccess, earnedScore, earnedStars);
    };

    // อัปเดตสถิติรวม
    const updateGameStats = (isSuccess, points, stars) => {
        // ดึงสถิติเดิม
        let stats = JSON.parse(localStorage.getItem('bridgeGame_stats') || '{}');
        
        // อัปเดตสถิติ
        stats.totalPlayed = (stats.totalPlayed || 0) + 1;
        stats.successfulBuilds = (stats.successfulBuilds || 0) + (isSuccess ? 1 : 0);
        stats.failedBuilds = (stats.failedBuilds || 0) + (isSuccess ? 0 : 1);
        stats.totalPoints = (stats.totalPoints || 0) + (isSuccess ? points : 0);
        stats.totalStars = (stats.totalStars || 0) + (isSuccess ? stars : 0);
        stats.lastPlayed = new Date().toISOString();
        
        // บันทึกลง localStorage
        localStorage.setItem('bridgeGame_stats', JSON.stringify(stats));
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

    return (
        <div className="bridge-game">
            <div className="game-header">
                <h1>เกมสร้างสะพาน - {levels[currentLevel - 1].name}</h1>
                <div className="game-stats">
                    <div className="score">คะแนน: {score}</div>
                    <div className={`timer ${timeLeft <= 60 ? 'timer-warning' : ''}`}>
                        เวลา: {formatTime(timeLeft)}
                    </div>
                    <StarRating stars={stars} />
                </div>
            </div>

            <div className="game-content">
                <div className="level-info">
                    <h3>ด่านที่ {currentLevel}: {levels[currentLevel - 1].name}</h3>
                    <p>{levels[currentLevel - 1].description}</p>
                    <p>ความยาวสะพาน: {levels[currentLevel - 1].length} หน่วย</p>
                    <p>ความแข็งแรงที่ต้องการ: {levels[currentLevel - 1].requiredStrength}</p>
                    <p>งบประมาณเริ่มต้น: {levels[currentLevel - 1].budget} บาท</p>
                    <p>สภาพแวดล้อม: {getEnvironmentInfo()}</p>
                    <p>เงื่อนไขพิเศษ: {levels[currentLevel - 1].specialConditions}</p>
                </div>

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
                                    <button onClick={goToNextLevel}>
                                        {currentLevel < levels.length ? 'ไปด่านต่อไป' : 'จบเกม'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

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
            </div>

            <div className="game-footer">
                <button className="home-button" onClick={goToHome}>
                    กลับหน้าหลัก
                </button>
            </div>
        </div>
    );
};

export default BridgeGame;