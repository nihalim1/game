import React, { useState, useEffect } from 'react';
import './CodingGame.css';

import { useNavigate } from 'react-router-dom';

const CodingGame = ({ onMount, onUnmount }) => {
    const navigate = useNavigate();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [commands, setCommands] = useState([]);
    const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
    const [targetPosition, setTargetPosition] = useState({ x: 200, y: 0 });
    const [isRunning, setIsRunning] = useState(false);
    const GRID_SIZE = 8; // 8x8 grid
    const CELL_SIZE = 50; // 50px per cell
    const [characterDirection, setCharacterDirection] = useState('right'); // เพิ่ม state สำหรับทิศทาง
    const [grid, setGrid] = useState([]);
    const [score, setScore] = useState(0);
    const [obstacles, setObstacles] = useState([]);
    const [levelDescription, setLevelDescription] = useState('');
    const [totalScore, setTotalScore] = useState(0); // Add total score state
    // เพิ่ม state สำหรับเก็บดาวแต่ละด่าน
    const [starsPerLevel, setStarsPerLevel] = useState({});
    
    // เพิ่ม state สำหรับแสดงผลเมื่อเล่นจบเกม
    const [showGameComplete, setShowGameComplete] = useState(false);

    // เพิ่ม state เก็บคำแนะนำสำหรับแต่ละด่าน
    const [levelHint, setLevelHint] = useState('');
    // เพิ่ม state แสดงคำแนะนำ
    const [showHint, setShowHint] = useState(false);

    // เพิ่ม state สำหรับควบคุมเพลง
    const [backgroundMusic, setBackgroundMusic] = useState(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);

    // เพิ่ม state สำหรับจับเวลานับขึ้น
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [usedTimePerLevel, setUsedTimePerLevel] = useState({}); // เก็บเวลาที่ใช้จริงแต่ละด่าน

    const addCommand = (command) => {
        playSound('click.mp3');
        setCommands([...commands, command]);
    };

    const runProgram = () => {
        playSound('button.mp3');
        setIsRunning(true);
        let currentPosition = { ...characterPosition };
        let currentDirection = characterDirection;
        let hasCollided = false;
        
        commands.forEach((command, index) => {
            setTimeout(() => {
                if (hasCollided) return;
                
                let newPosition = { ...currentPosition };
                
                switch(command) {
                    case 'เดินหน้า':
                        switch(currentDirection) {
                            case 'right':
                                newPosition.x += CELL_SIZE;
                                break;
                            case 'left':
                                newPosition.x -= CELL_SIZE;
                                break;
                            case 'up':
                                newPosition.y -= CELL_SIZE;
                                break;
                            case 'down':
                                newPosition.y += CELL_SIZE;
                                break;
                        }
                        // ตรวจสอบการชนกับอุปสรรค
                        const collided = obstacles.some(obstacle => 
                            obstacle.x === newPosition.x && obstacle.y === newPosition.y
                        );
                        // ตรวจสอบว่าอยู่นอกกริดหรือไม่
                        const outOfBounds = 
                            newPosition.x < 0 || 
                            newPosition.x >= GRID_SIZE * CELL_SIZE || 
                            newPosition.y < 0 || 
                            newPosition.y >= GRID_SIZE * CELL_SIZE;
                        // ตรวจสอบว่าอยู่บน path หรือไม่
                        const gridX = newPosition.x / CELL_SIZE;
                        const gridY = newPosition.y / CELL_SIZE;
                        let notOnPath = false;
                        if (!outOfBounds && grid[gridY] && grid[gridY][gridX] !== 'path') {
                            notOnPath = true;
                        }
                        if (collided || outOfBounds || notOnPath) {
                            hasCollided = true;
                            playSound('wrong.mp3');
                            setTimeout(() => {
                                setIsRunning(false);
                                setCommands([]);
                                setCharacterPosition({ ...characterPosition });
                                setCharacterDirection(characterDirection);
                            }, 500);
                            return;
                        }
                        currentPosition = newPosition;
                        setCharacterPosition({ ...currentPosition });
                        break;
                    case 'หันซ้าย':
                        switch(currentDirection) {
                            case 'right': currentDirection = 'up'; break;
                            case 'up': currentDirection = 'left'; break;
                            case 'left': currentDirection = 'down'; break;
                            case 'down': currentDirection = 'right'; break;
                        }
                        setCharacterDirection(currentDirection);
                        break;
                    case 'หันขวา':
                        switch(currentDirection) {
                            case 'right': currentDirection = 'down'; break;
                            case 'down': currentDirection = 'left'; break;
                            case 'left': currentDirection = 'up'; break;
                            case 'up': currentDirection = 'right'; break;
                        }
                        setCharacterDirection(currentDirection);
                        break;
                    case 'ขึ้นบน':
                        currentDirection = 'up';
                        setCharacterDirection(currentDirection);
                        break;
                    case 'ลงล่าง':
                        currentDirection = 'down';
                        setCharacterDirection(currentDirection);
                        break;
                }
                
                if (index === commands.length - 1 && !hasCollided) {
                    if (currentPosition.x === targetPosition.x && 
                        currentPosition.y === targetPosition.y) {
                        playSound('level_complete.mp3');
                        const levelScore = calculateScore(commands.length, currentLevel);
                        const newScore = score + levelScore;
                        const newTotalScore = totalScore + levelScore;
                        setScore(newScore);
                        setTotalScore(newTotalScore);
                        // หยุดจับเวลา
                        if (timerInterval) clearInterval(timerInterval);
                        setTimerInterval(null);
                        // คำนวณเวลาที่ใช้จริง
                        const usedTime = elapsedTime;
                        setUsedTimePerLevel(prev => ({ ...prev, [currentLevel]: usedTime }));
                        const earnedStars = calculateStars(usedTime);
                        setStarsPerLevel(prev => ({
                            ...prev,
                            [currentLevel]: earnedStars
                        }));
                        handleLevelComplete(earnedStars);
                    } else {
                        playSound('wrong.mp3');
                        // หยุดจับเวลา
                        if (timerInterval) clearInterval(timerInterval);
                        setTimerInterval(null);
                        console.error('กรุณาลองใหม่อีกครั้ง');
                    }
                    setIsRunning(false);
                    setCommands([]);
                    setCharacterPosition({ ...characterPosition });
                    setCharacterDirection(characterDirection);
                }
            }, index * 1000);
        });
    };

    // คำนวณคะแนนขึ้นอยู่กับจำนวนคำสั่งและระดับความยาก
    const calculateScore = (commandCount, level) => {
        // คะแนนเต็ม 100 คะแนน
        return 100;
    };

    // ปรับฟังก์ชันคำนวณดาวตามเวลา
    const calculateStars = (timeUsed) => {
        if (timeUsed <= 60) return 4;
        if (timeUsed <= 120) return 3;
        if (timeUsed <= 180) return 2;
        return 1;
    };

    const resetGame = () => {
        playSound('button.mp3');
        setCommands([]);
        setCharacterPosition({ ...getStartingPosition(currentLevel) });
        setCharacterDirection(getStartingDirection(currentLevel));
        setIsRunning(false);
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        setElapsedTime(0);
    };

    // ฟังก์ชันสำหรับตำแหน่งเริ่มต้นของตัวละคร
    const getStartingPosition = (level) => {
        switch(level) {
            case 1: return { x: 0, y: 3 * CELL_SIZE };
            case 2: return { x: 0, y: 3 * CELL_SIZE };
            case 3: return { x: 0, y: 0 };
            case 4: return { x: 0, y: 0 };
            default: return { x: 0, y: 3 * CELL_SIZE };
        }
    };

    // ฟังก์ชันสำหรับทิศทางเริ่มต้นของตัวละคร
    const getStartingDirection = (level) => {
        switch(level) {
            case 1: return 'right';
            case 2: return 'right';
            case 3: return 'right';
            case 4: return 'right';
            default: return 'right';
        }
    };

    const saveProgress = (level) => {
        // ดึงข้อมูลนักเรียน
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        const studentId = student.id;
        
        if (!studentId) {
            console.warn('ไม่พบรหัสนักเรียน ไม่สามารถบันทึกความก้าวหน้าได้');
            return;
        }
        
        const savedProgress = localStorage.getItem(`gameProgress_${studentId}`) || JSON.stringify({
            totalLevels: 4,
            completedLevels: 0,
            lastPlayedLevel: 1,
            achievements: []
        });
        
        const progress = JSON.parse(savedProgress);
        
        if (level > progress.completedLevels) {
            progress.completedLevels = level;
        }
        progress.lastPlayedLevel = level + 1;
        
        localStorage.setItem(`gameProgress_${studentId}`, JSON.stringify(progress));
    };

    // เพิ่มฟังก์ชันดึงข้อมูลด่าน
    const getLevelData = (level) => {
        // กำหนด timeLimit ของแต่ละด่าน (วินาที)
        const levelConfigs = [
            { timeLimit: 120 }, // ด่าน 1
            { timeLimit: 180 }, // ด่าน 2
            { timeLimit: 240 }, // ด่าน 3
            { timeLimit: 300 }, // ด่าน 4
        ];
        return levelConfigs[level - 1] || { timeLimit: 120 };
    };

    // ปรับ handleLevelComplete ให้รับ earnedStars
    const handleLevelComplete = (earnedStars) => {
        playSound('achievement.mp3');
        const levelScore = calculateScore(commands.length, currentLevel);
        const newScore = score + levelScore;
        const newTotalScore = totalScore + levelScore;
        setStarsPerLevel(prev => ({
            ...prev,
            [currentLevel]: earnedStars
        }));

        console.log(`ผ่านด่านที่ ${currentLevel} แล้ว คะแนน: ${newScore}`);
        saveProgress(currentLevel);

        setScore(newScore);
        setTotalScore(newTotalScore);

        if (currentLevel < 4) {
            setCurrentLevel(currentLevel + 1);
        } else {
            stopBackgroundMusic(); // หยุดเพลงเมื่อจบเกม
            playSound('victory_music.mp3');
            setShowGameComplete(true);
        }
    };

    // แสดงคำแนะนำ
    const toggleHint = () => {
        setShowHint(!showHint);
    };

    // เรียกใช้เมื่อจบเกมหรือผ่านด่าน
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

    useEffect(() => {
        const createLevel = (level) => {
            const newGrid = Array(GRID_SIZE).fill().map(() => 
                Array(GRID_SIZE).fill('empty')
            );

            const newObstacles = [];
            
            switch(level) {
                case 1:
                    setLevelDescription('ด่านที่ 1: เส้นทางเดินตรง');
                    setLevelHint('ใช้คำสั่ง "เดินหน้า" หลายๆ ครั้งเพื่อไปถึงเป้าหมาย');
                    
                    for(let i = 0; i < 5; i++) {
                        newGrid[3][i] = 'path';
                    }
                    setTargetPosition({ x: 4 * CELL_SIZE, y: 3 * CELL_SIZE });
                    break;
                
                case 2:
                    setLevelDescription('ด่านที่ 2: ทางเลี้ยวขวา');
                    setLevelHint('ใช้คำสั่ง "เดินหน้า" และ "หันขวา" เพื่อเลี้ยวขวาและไปถึงเป้าหมาย');
                    
                    // เส้นทางหลัก
                    for(let i = 0; i < 3; i++) {
                        newGrid[3][i] = 'path';
                    }
                    for(let i = 3; i < 6; i++) {
                        newGrid[i][2] = 'path';
                    }
                    setTargetPosition({ x: 2 * CELL_SIZE, y: 5 * CELL_SIZE });
                    // เส้นทางหลอก
                    for(let j = 0; j < 5; j++) {
                        newGrid[5][j] = 'path'; // แนวนอนล่างสุด
                    }
                    for(let i = 4; i < 6; i++) {
                        newGrid[i][4] = 'path'; // ทางตันแนวตั้ง
                    }
                    break;
                
                case 3:
                    setLevelDescription('ด่านที่ 3: เขาวงกตเบื้องต้น');
                    setLevelHint('คุณต้องเดินตามเส้นทางที่กำหนดและหลบอุปสรรค');
                    // เส้นทางหลัก
                    for(let i=0; i<=4; i++) newGrid[i][0] = 'path'; // (0,0) ถึง (4,0)
                    for(let j=0; j<=4; j++) newGrid[4][j] = 'path'; // (4,0) ถึง (4,4)
                    for(let i=1; i<=4; i++) newGrid[i][4] = 'path'; // (1,4) ถึง (4,4)
                    newGrid[3][1] = 'path';
                    newGrid[3][2] = 'path';
                    // เส้นทางหลอก
                    for(let j=1; j<=3; j++) newGrid[1][j] = 'path'; // แนวนอนบน (1,1)-(1,3)
                    for(let i=2; i<=3; i++) newGrid[i][2] = 'path'; // ทางตันแนวตั้ง (2,2)-(3,2)
                    for(let j=2; j<=4; j++) newGrid[2][j] = 'path'; // แนวนอนหลอก (2,2)-(2,4)
                    // อุปสรรค
                    newObstacles.push({ x: 2 * CELL_SIZE, y: 3 * CELL_SIZE }); // (2,3)
                    newObstacles.push({ x: 4 * CELL_SIZE, y: 2 * CELL_SIZE }); // (4,2)
                    setTargetPosition({ x: 4 * CELL_SIZE, y: 4 * CELL_SIZE });
                    break;
                
                case 4:
                    setLevelDescription('ด่านที่ 4: การทดสอบขั้นสูง');
                    setLevelHint('นี่คือบททดสอบสุดท้าย คุณต้องใช้ทุกทักษะที่ได้เรียนรู้มา');
                    // เส้นทางหลัก
                    for(let j=0; j<=3; j++) newGrid[0][j] = 'path'; // (0,0)-(0,3)
                    for(let i=1; i<=3; i++) newGrid[i][3] = 'path'; // (1,3)-(3,3)
                    for(let j=3; j<=6; j++) newGrid[3][j] = 'path'; // (3,3)-(3,6)
                    for(let i=4; i<=7; i++) newGrid[i][6] = 'path'; // (4,6)-(7,6)
                    newGrid[7][7] = 'path'; // (7,7) เป้าหมาย
                    // ทางอ้อม obstacle
                    newGrid[2][4] = 'path';
                    newGrid[2][5] = 'path';
                    newGrid[3][5] = 'path';
                    newGrid[4][5] = 'path';
                    newGrid[5][5] = 'path';
                    newGrid[6][5] = 'path';
                    newGrid[7][5] = 'path';
                    // เส้นทางหลอก
                    for(let j=0; j<=2; j++) newGrid[5][j] = 'path'; // แนวนอนล่าง (5,0)-(5,2)
                    for(let i=5; i<=7; i++) newGrid[i][2] = 'path'; // แนวตั้งหลอก (5,2)-(7,2)
                    for(let j=3; j<=5; j++) newGrid[6][j] = 'path'; // แนวนอนหลอก (6,3)-(6,5)
                    // อุปสรรค
                    newObstacles.push({ x: 4 * CELL_SIZE, y: 4 * CELL_SIZE }); // (4,4)
                    newObstacles.push({ x: 6 * CELL_SIZE, y: 6 * CELL_SIZE }); // (6,6)
                    newObstacles.push({ x: 7 * CELL_SIZE, y: 5 * CELL_SIZE }); // (7,5)
                    setTargetPosition({ x: 7 * CELL_SIZE, y: 7 * CELL_SIZE });
                    break;
                
                default:
                    setLevelDescription('ด่านทดสอบ');
                    setLevelHint('เดินหน้าไปยังเป้าหมาย');
                    
                    for(let i = 0; i < 5; i++) {
                        newGrid[3][i] = 'path';
                    }
                    setTargetPosition({ x: 4 * CELL_SIZE, y: 3 * CELL_SIZE });
            }
            
            // ปรับ grid ให้แสดงอุปสรรค
            newObstacles.forEach(obstacle => {
                const x = obstacle.x / CELL_SIZE;
                const y = obstacle.y / CELL_SIZE;
                if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
                    newGrid[y][x] = 'obstacle';
                }
            });
            
            setGrid(newGrid);
            setObstacles(newObstacles);
            setCharacterPosition(getStartingPosition(level));
            setCharacterDirection(getStartingDirection(level));
        };

        createLevel(currentLevel);
    }, [currentLevel, CELL_SIZE, GRID_SIZE]);

    useEffect(() => {
        // เรียกฟังก์ชัน onMount เมื่อ component ถูกแสดง
        if (onMount) onMount();
        
        // เรียกฟังก์ชัน onUnmount เมื่อ component ถูกลบ
        return () => {
            if (onUnmount) onUnmount();
        };
    }, [onMount, onUnmount]);

    useEffect(() => {
        if (showGameComplete) {
            // ดึงข้อมูลนักเรียน
            const student = JSON.parse(localStorage.getItem('student') || '{}');
            const studentId = student.student_id || student.id;
            if (studentId) {
                // รวมดาวทั้งหมด
                const totalStars = Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0);
                saveScoreToServer(studentId, 'codingGame', totalScore, totalStars);
            }
        }
    }, [showGameComplete]);

    useEffect(() => {
        // เริ่มเล่นเพลงเมื่อเริ่มเกม
        playBackgroundMusic();

        // หยุดเพลงเมื่อออกจากเกม
        return () => {
            stopBackgroundMusic();
        };
    }, []);

    // useEffect สำหรับเริ่มจับเวลานับขึ้นเมื่อเข้าแต่ละด่าน
    useEffect(() => {
        setElapsedTime(0);
        if (timerInterval) clearInterval(timerInterval);
        if (showGameComplete) return; // ไม่จับเวลาถ้าเกมจบ
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        return () => {
            clearInterval(interval);
            setTimerInterval(null);
        };
    }, [currentLevel, showGameComplete]);

    const getCharacterEmoji = () => {
        switch(characterDirection) {
            case 'right': return '👉';
            case 'left': return '👈';
            case 'up': return '👆';
            case 'down': return '👇';
            default: return '👉';
        }
    };

    const goToHome = () => {
        stopBackgroundMusic();
        playSound('button.mp3');
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        navigate('/student-dashboard');
    };

    // เพิ่มฟังก์ชันเล่นเสียง
    const playSound = (file) => {
        const audio = new Audio(process.env.PUBLIC_URL + '/sounds/' + file);
        audio.play();
    };

    // เพิ่มฟังก์ชันเล่นเพลง
    const playBackgroundMusic = () => {
        if (!backgroundMusic) {
            const music = new Audio(process.env.PUBLIC_URL + '/sounds/MV.mp3');
            music.loop = true;
            music.volume = 0.3; // ปรับระดับเสียงให้เหมาะสม
            setBackgroundMusic(music);
            music.play();
            setIsMusicPlaying(true);
        } else if (!isMusicPlaying) {
            backgroundMusic.play();
            setIsMusicPlaying(true);
        }
    };

    // เพิ่มฟังก์ชันหยุดเพลง
    const stopBackgroundMusic = () => {
        if (backgroundMusic && isMusicPlaying) {
            backgroundMusic.pause();
            setIsMusicPlaying(false);
        }
    };

    // เพิ่มฟังก์ชันฟอร์แมตเวลา
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="coding-game">
            <div className="game-header">
                <h2>บล็อกคำสั่ง : เขาวงกต</h2>
                <div className="level-info">
                    <div className="level-indicator">
                        ด่านที่ {currentLevel} / 4
                    </div>
                    <div className="score-display">
                        คะแนนรวม: {totalScore}
                    </div>
                    <div className="timer-display" style={{ marginLeft: 16, fontWeight: 'bold', color: elapsedTime > 60 ? '#d32f2f' : '#1976d2', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 4 }}>⏱️</span> {formatTime(elapsedTime)}
                    </div>
                </div>
                <div className="level-description">
                    {levelDescription}
                </div>
            </div>

            <div className="game-container">
                <div className="game-board">
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid-row">
                            {row.map((cell, colIndex) => (
                                <div 
                                    key={`${rowIndex}-${colIndex}`} 
                                    className={`grid-cell ${cell}`}
                                />
                            ))}
                        </div>
                    ))}
                    <div 
                        className="character"
                        style={{
                            left: `${characterPosition.x}px`,
                            top: `${characterPosition.y}px`
                        }}
                    >
                        {getCharacterEmoji()}
                    </div>
                    <div 
                        className="target"
                        style={{
                            left: `${targetPosition.x}px`,
                            top: `${targetPosition.y}px`
                        }}
                    >
                        🎯
                    </div>
                </div>

                <div className="command-panel">
                    <div className="level-controls">
                        <button onClick={toggleHint} className="hint-button">
                            {showHint ? "ซ่อนคำแนะนำ" : "แสดงคำแนะนำ"}
                        </button>
                        {showHint && (
                            <div className="hint-box">
                                {levelHint}
                            </div>
                        )}
                    </div>

                    <div className="command-buttons">
                        <button 
                            onClick={() => addCommand('ขึ้นบน')}
                            disabled={isRunning}
                            className="direction-btn up"
                        >
                            ⬆️ ขึ้นบน
                        </button>
                        <div className="middle-buttons">
                            <button 
                                onClick={() => addCommand('หันซ้าย')}
                                disabled={isRunning}
                            >
                                ⬅️ หันซ้าย
                            </button>
                            <button 
                                onClick={() => addCommand('เดินหน้า')}
                                disabled={isRunning}
                            >
                                เดินหน้า
                            </button>
                            <button 
                                onClick={() => addCommand('หันขวา')}
                                disabled={isRunning}
                            >
                                หันขวา ➡️
                            </button>
                        </div>
                        <button 
                            onClick={() => addCommand('ลงล่าง')}
                            disabled={isRunning}
                            className="direction-btn down"
                        >
                            ⬇️ ลงล่าง
                        </button>
                    </div>

                    <div className="command-list">
                        <div className="command-list-header">คำสั่งของคุณ:</div>
                        {commands.map((command, index) => (
                            <div key={index} className="command-item">
                                {index + 1}. {command}
                            </div>
                        ))}
                    </div>

                    <div className="control-buttons">
                        <button 
                            onClick={runProgram}
                            disabled={isRunning || commands.length === 0}
                            className="run-button"
                        >
                            ▶ เริ่มใช้โปรแกรม
                        </button>
                        <button 
                            onClick={resetGame}
                            disabled={isRunning}
                            className="reset-button"
                        >
                            🔄 รีเซ็ต
                        </button>
                        <button 
                            onClick={goToHome}
                            className="home-button"
                        >
                            🏠 กลับหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>

            {/* เพิ่ม Modal แสดงผลเมื่อเล่นจบเกม */}
            {showGameComplete && (
                <div className="game-complete-modal">
                    <div className="game-complete-content">
                        <h2>🏆 ยินดีด้วย! คุณเล่นจบเกมแล้ว 🏆</h2>
                        <div className="game-complete-details">
                            <p className="complete-score">คะแนนรวมทั้งหมด: <span>{totalScore}</span> คะแนน</p>
                            <p>คุณผ่านทั้ง 4 ด่านเรียบร้อยแล้ว!</p>
                            <div className="stars-summary" style={{ textAlign: 'center', margin: '24px 0' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 8, color: '#7c4dff', letterSpacing: 1 }}>
                                    ⭐ ดาวสะสม ⭐
                                </div>
                                <div className="star-row">
                                    {(() => {
                                        const totalStars = Math.min(16, Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0));
                                        return (
                                            <>
                                                {Array.from({ length: totalStars }).map((_, i) => (
                                                    <span key={i} style={{ color: '#FFD700', textShadow: '0 0 8px #fff200' }}>★</span>
                                                ))}
                                                {Array.from({ length: 16 - totalStars }).map((_, i) => (
                                                    <span key={i + totalStars} style={{ color: '#e0e0e0' }}>★</span>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </div>
                                <div style={{ marginTop: 8, fontSize: '1.1rem', color: '#333' }}>
                                    {Math.min(16, Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0))} / 16 ดาว
                                </div>
                            </div>
                            <div className="used-time-summary" style={{ marginTop: 16 }}>
                                <h4>เวลาที่ใช้แต่ละด่าน:</h4>
                                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                                    {Object.entries(usedTimePerLevel).map(([level, time]) => (
                                        <li key={level}>ด่าน {level}: {formatTime(time)} นาที</li>
                                    ))}
                                </ul>
                            </div>
                            <p>ทักษะการเขียนโค้ดของคุณยอดเยี่ยมมาก</p>
                        </div>
                        <div className="game-complete-buttons">
                            <button 
                                onClick={() => {
                                    setCurrentLevel(1);
                                    setScore(0);
                                    setTotalScore(0);
                                    setShowGameComplete(false);
                                    setCommands([]);
                                    setCharacterPosition(getStartingPosition(1));
                                    setCharacterDirection(getStartingDirection(1));
                                    setElapsedTime(0);
                                    setUsedTimePerLevel({});
                                    setStarsPerLevel({});
                                }}
                                className="play-again-button"
                            >
                                🔄 เล่นใหม่
                            </button>
                            <button 
                                onClick={goToHome}
                                className="home-button"
                            >
                                🏠 กลับหน้าหลัก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodingGame;