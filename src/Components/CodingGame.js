import React, { useState, useEffect } from 'react';
import './CodingGame.css';
import { saveGameProgress, getGameProgress } from '../utils/gameProgress';
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

    // เพิ่ม state เก็บคำแนะนำสำหรับแต่ละด่าน
    const [levelHint, setLevelHint] = useState('');
    // เพิ่ม state แสดงคำแนะนำ
    const [showHint, setShowHint] = useState(false);

    const addCommand = (command) => {
        setCommands([...commands, command]);
    };

    const runProgram = () => {
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
                        
                        if (collided || outOfBounds) {
                            hasCollided = true;
                            console.error('ชนกับอุปสรรคหรือออกนอกเส้นทาง');
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
                        const levelScore = calculateScore(commands.length, currentLevel);
                        setScore(prevScore => prevScore + levelScore);
                        handleLevelComplete();
                    } else {
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
        const baseScore = 100 * level;
        const efficiency = Math.max(0, 1 - (commandCount / 20)); // ยิ่งใช้คำสั่งน้อยยิ่งได้คะแนนมาก
        return Math.round(baseScore * (0.5 + efficiency));
    };

    const resetGame = () => {
        setCommands([]);
        setCharacterPosition({ ...getStartingPosition(currentLevel) });
        setCharacterDirection(getStartingDirection(currentLevel));
        setIsRunning(false);
    };

    // ฟังก์ชันสำหรับตำแหน่งเริ่มต้นของตัวละคร
    const getStartingPosition = (level) => {
        switch(level) {
            case 1: return { x: 0, y: 3 * CELL_SIZE };
            case 2: return { x: 0, y: 3 * CELL_SIZE };
            case 3: return { x: 0, y: 4 * CELL_SIZE };
            case 4: return { x: 0, y: 0 };
            case 5: return { x: 0, y: 0 };
            case 6: return { x: 3 * CELL_SIZE, y: 0 };
            case 7: return { x: 0, y: 3 * CELL_SIZE };
            case 8: return { x: 0, y: 0 };
            case 9: return { x: 4 * CELL_SIZE, y: 0 };
            case 10: return { x: 0, y: 0 };
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
            case 5: return 'right';
            case 6: return 'down';
            case 7: return 'right';
            case 8: return 'right';
            case 9: return 'down';
            case 10: return 'right';
            default: return 'right';
        }
    };

    const saveProgress = (level) => {
        const savedProgress = localStorage.getItem('gameProgress') || JSON.stringify({
            totalLevels: 10,
            completedLevels: 0,
            lastPlayedLevel: 1,
            achievements: []
        });
        
        const progress = JSON.parse(savedProgress);
        
        // อัพเดทความก้าวหน้า
        if (level > progress.completedLevels) {
            progress.completedLevels = level;
        }
        progress.lastPlayedLevel = level + 1;
        
        // บันทึกลง localStorage
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    };

    const handleLevelComplete = () => {
        console.log(`ผ่านด่านที่ ${currentLevel} แล้ว คะแนน: ${score}`);
        saveProgress(currentLevel);
        
        // บันทึกความก้าวหน้า
        saveGameProgress('codingGame', {
            completedLevels: currentLevel,
            lastScore: score,
            highestScore: Math.max(score, getGameProgress('codingGame').highestScore || 0)
        });
        
        if (currentLevel < 10) {
            setCurrentLevel(currentLevel + 1);
        } else {
            alert("ยินดีด้วย! คุณชนะเกมแล้ว!");
        }
    };

    // แสดงคำแนะนำ
    const toggleHint = () => {
        setShowHint(!showHint);
    };

    useEffect(() => {
        const createLevel = (level) => {
            const newGrid = Array(GRID_SIZE).fill().map(() => 
                Array(GRID_SIZE).fill('empty')
            );

            const newObstacles = [];
            
            // กำหนดเส้นทางและอุปสรรคตามด่าน
            switch(level) {
                case 1:
                    // ด่านที่ 1: เส้นทางตรงง่ายๆ
                    setLevelDescription('ด่านที่ 1: เส้นทางเดินตรง');
                    setLevelHint('ใช้คำสั่ง "เดินหน้า" หลายๆ ครั้งเพื่อไปถึงเป้าหมาย');
                    
                    for(let i = 0; i < 5; i++) {
                        newGrid[3][i] = 'path';
                    }
                    setTargetPosition({ x: 4 * CELL_SIZE, y: 3 * CELL_SIZE });
                    break;
                
                case 2:
                    // ด่านที่ 2: เส้นทางเลี้ยวขวา 1 ครั้ง
                    setLevelDescription('ด่านที่ 2: ทางเลี้ยวขวา');
                    setLevelHint('ใช้คำสั่ง "เดินหน้า" และ "หันขวา" เพื่อเลี้ยวขวาและไปถึงเป้าหมาย');
                    
                    for(let i = 0; i < 3; i++) {
                        newGrid[3][i] = 'path';
                    }
                    for(let i = 3; i < 6; i++) {
                        newGrid[i][2] = 'path';
                    }
                    setTargetPosition({ x: 2 * CELL_SIZE, y: 5 * CELL_SIZE });
                    break;
                
                case 3:
                    // ด่านที่ 3: เส้นทางเลี้ยวซ้าย 1 ครั้ง
                    setLevelDescription('ด่านที่ 3: ทางเลี้ยวซ้าย');
                    setLevelHint('ใช้คำสั่ง "เดินหน้า" และ "หันซ้าย" เพื่อเลี้ยวซ้ายและไปถึงเป้าหมาย');
                    
                    for(let i = 0; i < 3; i++) {
                        newGrid[4][i] = 'path';
                    }
                    for(let i = 1; i < 4; i++) {
                        newGrid[i][2] = 'path';
                    }
                    setTargetPosition({ x: 2 * CELL_SIZE, y: 1 * CELL_SIZE });
                    break;
                
                case 4:
                    // ด่านที่ 4: เส้นทางรูปตัว Z
                    setLevelDescription('ด่านที่ 4: เส้นทางรูปตัว Z');
                    setLevelHint('คุณต้องเลี้ยวหลายครั้งเพื่อเดินตามเส้นทางรูปตัว Z');
                    
                    for(let i = 0; i < 3; i++) {
                        newGrid[0][i] = 'path';
                    }
                    for(let i = 0; i < 3; i++) {
                        newGrid[i][2] = 'path';
                    }
                    for(let i = 2; i < 5; i++) {
                        newGrid[2][i] = 'path';
                    }
                    for(let i = 2; i < 5; i++) {
                        newGrid[i][4] = 'path';
                    }
                    for(let i = 4; i < 7; i++) {
                        newGrid[4][i] = 'path';
                    }
                    setTargetPosition({ x: 6 * CELL_SIZE, y: 4 * CELL_SIZE });
                    break;
                
                case 5:
                    // ด่านที่ 5: เส้นทางพร้อมอุปสรรค
                    setLevelDescription('ด่านที่ 5: เส้นทางที่มีอุปสรรค');
                    setLevelHint('ระวังอุปสรรคสีแดง คุณต้องหลบเพื่อไม่ให้ชน');
                    
                    for(let i = 0; i < 7; i++) {
                        newGrid[0][i] = 'path';
                    }
                    for(let i = 0; i < 5; i++) {
                        newGrid[i][6] = 'path';
                    }
                    
                    // เพิ่มอุปสรรค
                    newObstacles.push({ x: 3 * CELL_SIZE, y: 0 });
                    
                    setTargetPosition({ x: 6 * CELL_SIZE, y: 4 * CELL_SIZE });
                    break;
                
                case 6:
                    // ด่านที่ 6: เขาวงกตง่าย
                    setLevelDescription('ด่านที่ 6: เขาวงกตเบื้องต้น');
                    setLevelHint('คุณต้องเดินตามเส้นทางที่กำหนดและหลบอุปสรรค');
                    
                    for(let i = 0; i < 5; i++) {
                        newGrid[i][3] = 'path';
                    }
                    for(let i = 3; i < 7; i++) {
                        newGrid[4][i] = 'path';
                    }
                    
                    // เพิ่มอุปสรรค
                    newObstacles.push({ x: 3 * CELL_SIZE, y: 2 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 4 * CELL_SIZE });
                    
                    setTargetPosition({ x: 6 * CELL_SIZE, y: 4 * CELL_SIZE });
                    break;
                
                case 7:
                    // ด่านที่ 7: เขาวงกตปานกลาง
                    setLevelDescription('ด่านที่ 7: เขาวงกตซับซ้อน');
                    setLevelHint('คุณต้องเลือกเส้นทางที่ถูกต้องในเขาวงกต หลบอุปสรรคหลายอัน');
                    
                    for(let i = 0; i < 6; i++) {
                        newGrid[3][i] = 'path';
                    }
                    for(let i = 1; i < 6; i++) {
                        newGrid[i][5] = 'path';
                    }
                    for(let i = 5; i < 8; i++) {
                        newGrid[1][i] = 'path';
                    }
                    
                    // เพิ่มอุปสรรค
                    newObstacles.push({ x: 2 * CELL_SIZE, y: 3 * CELL_SIZE });
                    newObstacles.push({ x: 4 * CELL_SIZE, y: 3 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 2 * CELL_SIZE });
                    
                    setTargetPosition({ x: 7 * CELL_SIZE, y: 1 * CELL_SIZE });
                    break;
                
                case 8:
                    // ด่านที่ 8: เขาวงกตซับซ้อน
                    setLevelDescription('ด่านที่ 8: เขาวงกตซับซ้อนมาก');
                    setLevelHint('คิดวางแผนอย่างรอบคอบก่อนเดิน อุปสรรคมีมากขึ้น');
                    
                    for(let i = 0; i < 3; i++) {
                        newGrid[0][i] = 'path';
                    }
                    for(let i = 0; i < 5; i++) {
                        newGrid[i][2] = 'path';
                    }
                    for(let i = 2; i < 5; i++) {
                        newGrid[4][i] = 'path';
                    }
                    for(let i = 4; i < 7; i++) {
                        newGrid[i][4] = 'path';
                    }
                    for(let i = 4; i < 8; i++) {
                        newGrid[6][i] = 'path';
                    }
                    
                    // เพิ่มอุปสรรค
                    newObstacles.push({ x: 2 * CELL_SIZE, y: 1 * CELL_SIZE });
                    newObstacles.push({ x: 2 * CELL_SIZE, y: 3 * CELL_SIZE });
                    newObstacles.push({ x: 3 * CELL_SIZE, y: 4 * CELL_SIZE });
                    newObstacles.push({ x: 4 * CELL_SIZE, y: 5 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 6 * CELL_SIZE });
                    
                    setTargetPosition({ x: 7 * CELL_SIZE, y: 6 * CELL_SIZE });
                    break;
                
                case 9:
                    // ด่านที่ 9: เขาวงกตยากมาก
                    setLevelDescription('ด่านที่ 9: การทดสอบความอดทน');
                    setLevelHint('คุณต้องหาเส้นทางที่ยาวและซับซ้อน ความอดทนเป็นกุญแจสู่ความสำเร็จ');
                    
                    for(let j = 0; j < 8; j++) {
                        newGrid[0][j] = 'path';
                    }
                    for(let i = 0; i < 7; i++) {
                        newGrid[i][7] = 'path';
                    }
                    for(let j = 3; j < 8; j++) {
                        newGrid[6][j] = 'path';
                    }
                    for(let i = 2; i < 7; i++) {
                        newGrid[i][3] = 'path';
                    }
                    for(let j = 1; j < 4; j++) {
                        newGrid[2][j] = 'path';
                    }
                    for(let i = 2; i < 5; i++) {
                        newGrid[i][1] = 'path';
                    }
                    
                    // เพิ่มอุปสรรค
                    newObstacles.push({ x: 2 * CELL_SIZE, y: 0 });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 0 });
                    newObstacles.push({ x: 7 * CELL_SIZE, y: 2 * CELL_SIZE });
                    newObstacles.push({ x: 7 * CELL_SIZE, y: 4 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 6 * CELL_SIZE });
                    newObstacles.push({ x: 1 * CELL_SIZE, y: 6 * CELL_SIZE });
                    
                    setTargetPosition({ x: 1 * CELL_SIZE, y: 4 * CELL_SIZE });
                    break;
                
                case 10:
                    // ด่านที่ 10: จุดสุดท้าย
                    setLevelDescription('ด่านที่ 10: การทดสอบขั้นสูง');
                    setLevelHint('นี่คือบททดสอบสุดท้าย คุณต้องใช้ทุกทักษะที่ได้เรียนรู้มา');
                    
                    // สร้างเขาวงกตที่ซับซ้อนมาก
                    for(let j = 0; j < 4; j++) {
                        newGrid[0][j] = 'path';
                    }
                    for(let i = 0; i < 7; i++) {
                        newGrid[i][3] = 'path';
                    }
                    for(let j = 3; j < 8; j++) {
                        newGrid[6][j] = 'path';
                    }
                    for(let i = 1; i < 7; i++) {
                        newGrid[i][5] = 'path';
                    }
                    for(let j = 1; j < 6; j++) {
                        newGrid[1][j] = 'path';
                    }
                    
                    // เพิ่มอุปสรรคมากมาย
                    newObstacles.push({ x: 1 * CELL_SIZE, y: 0 });
                    newObstacles.push({ x: 3 * CELL_SIZE, y: 1 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 1 * CELL_SIZE });
                    newObstacles.push({ x: 3 * CELL_SIZE, y: 2 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 3 * CELL_SIZE });
                    newObstacles.push({ x: 2 * CELL_SIZE, y: 4 * CELL_SIZE });
                    newObstacles.push({ x: 5 * CELL_SIZE, y: 4 * CELL_SIZE });
                    newObstacles.push({ x: 3 * CELL_SIZE, y: 6 * CELL_SIZE });
                    newObstacles.push({ x: 7 * CELL_SIZE, y: 3 * CELL_SIZE });
                    
                    setTargetPosition({ x: 7 * CELL_SIZE, y: 6 * CELL_SIZE });
                    break;
                
                default:
                    // ด่านเริ่มต้น
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
        // ดึงความก้าวหน้าเดิม
        const progress = getGameProgress('codingGame');
        if (progress.completedLevels > 0) {
            setCurrentLevel(progress.completedLevels);
        }
    }, []);

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
        navigate('/student-dashboard');
    };

    return (
        <div className="coding-game">
            <div className="game-header">
                <h2>บล็อกคำสั่ง : เขาวงกต</h2>
                <div className="level-info">
                    <div className="level-indicator">
                        ด่านที่ {currentLevel} / 10
                    </div>
                    <div className="score-display">
                        คะแนน: {score}
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
        </div>
    );
};

export default CodingGame;