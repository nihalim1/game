import React, { useState, useEffect } from 'react';
import './MazeGame.css';
import { useNavigate } from 'react-router-dom';

const MazeGame = ({ onMount, onUnmount }) => {
    const navigate = useNavigate();
    const [currentLevel, setCurrentLevel] = useState(1);
    const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
    const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
    const [grid, setGrid] = useState([]);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [starsPerLevel, setStarsPerLevel] = useState({});
    const [showGameComplete, setShowGameComplete] = useState(false);
    const [levelDescription, setLevelDescription] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [levelHint, setLevelHint] = useState('');
    const [backgroundMusic, setBackgroundMusic] = useState(null);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [usedTimePerLevel, setUsedTimePerLevel] = useState({});
    const [movesCount, setMovesCount] = useState(0);
    
    const GRID_SIZE = 10; // 10x10 grid
    const CELL_SIZE = 40; // 40px per cell

    const moveCharacter = (direction) => {
        playSound('click.mp3');
        let newPosition = { ...characterPosition };
        
        switch(direction) {
            case 'up':
                newPosition.y -= 1;
                break;
            case 'down':
                newPosition.y += 1;
                break;
            case 'left':
                newPosition.x -= 1;
                break;
            case 'right':
                newPosition.x += 1;
                break;
            default:
                return;
        }
        
        // Check if new position is valid
        if (isValidMove(newPosition)) {
            setCharacterPosition(newPosition);
            setMovesCount(prev => prev + 1);
            
            // Check if reached target
            if (newPosition.x === targetPosition.x && newPosition.y === targetPosition.y) {
                levelComplete();
            }
        } else {
            playSound('wrong.mp3');
        }
    };
    
    const isValidMove = (position) => {
        // Check boundaries
        if (position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE) {
            return false;
        }
        
        // Check if the cell is a wall
        return grid[position.y][position.x] !== 'wall';
    };
    
    const levelComplete = () => {
        playSound('level_complete.mp3');
        // Stop timer
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        
        // Calculate score and stars
        const levelScore = calculateScore(movesCount, currentLevel);
        const newScore = score + levelScore;
        const newTotalScore = totalScore + levelScore;
        
        // Save time used for this level
        const usedTime = elapsedTime;
        setUsedTimePerLevel(prev => ({ ...prev, [currentLevel]: usedTime }));
        
        // Calculate stars based on time and moves
        const earnedStars = calculateStars(usedTime, movesCount, currentLevel);
        setStarsPerLevel(prev => ({
            ...prev,
            [currentLevel]: earnedStars
        }));
        
        setScore(newScore);
        setTotalScore(newTotalScore);
        saveProgress(currentLevel);
        
        if (currentLevel < 4) {
            setTimeout(() => {
                setCurrentLevel(currentLevel + 1);
                setMovesCount(0);
            }, 1000);
        } else {
            stopBackgroundMusic();
            playSound('victory_music.mp3');
            setShowGameComplete(true);
        }
    };
    
    const calculateScore = (moves, level) => {
        // Base score 100, minus penalties for excess moves
        const optimalMoves = getOptimalMoves(level);
        const penalty = Math.max(0, moves - optimalMoves) * 5;
        return Math.max(100 - penalty, 50); // Minimum score is 50
    };
    
    const calculateStars = (timeUsed, moves, level) => {
        const optimalMoves = getOptimalMoves(level);
        const optimalTime = getOptimalTime(level);
        
        // Calculate efficiency based on moves and time
        const moveEfficiency = optimalMoves / moves;
        const timeEfficiency = optimalTime / timeUsed;
        const totalEfficiency = (moveEfficiency + timeEfficiency) / 2;
        
        if (totalEfficiency >= 0.9) return 4; // Near perfect
        if (totalEfficiency >= 0.7) return 3; // Very good
        if (totalEfficiency >= 0.5) return 2; // Good
        return 1; // Completed
    };
    
    const getOptimalMoves = (level) => {
        switch(level) {
            case 1: return 10;
            case 2: return 15;
            case 3: return 20;
            case 4: return 30;
            default: return 10;
        }
    };
    
    const getOptimalTime = (level) => {
        switch(level) {
            case 1: return 30; // seconds
            case 2: return 45;
            case 3: return 60;
            case 4: return 90;
            default: return 30;
        }
    };
    
    const resetGame = () => {
        playSound('button.mp3');
        setMovesCount(0);
        setCharacterPosition(getStartingPosition(currentLevel));
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        setElapsedTime(0);
        
        // Restart timer
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
    };
    
    const getStartingPosition = (level) => {
        switch(level) {
            case 1: return { x: 0, y: 0 };
            case 2: return { x: 0, y: 0 };
            case 3: return { x: 0, y: 0 };
            case 4: return { x: 0, y: 0 };
            default: return { x: 0, y: 0 };
        }
    };
    
    const saveProgress = (level) => {
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        const studentId = student.id;
        
        if (!studentId) {
            console.warn('ไม่พบรหัสนักเรียน ไม่สามารถบันทึกความก้าวหน้าได้');
            return;
        }
        
        const savedProgress = localStorage.getItem(`mazeProgress_${studentId}`) || JSON.stringify({
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
        
        localStorage.setItem(`mazeProgress_${studentId}`, JSON.stringify(progress));
    };
    
    const toggleHint = () => {
        setShowHint(!showHint);
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
    
    useEffect(() => {
        const createMaze = (level) => {
            // Initialize empty grid
            const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('path'));
            
            switch(level) {
                case 1:
                    setLevelDescription('ด่านที่ 1: เขาวงกตง่าย');
                    setLevelHint('ใช้ปุ่มลูกศรเพื่อเดินไปยังเป้าหมาย หลีกเลี่ยงกำแพง');
                    
                    // Add walls for level 1 (simple maze)
                    for (let i = 2; i < 8; i++) newGrid[1][i] = 'wall';
                    for (let i = 1; i < 7; i++) newGrid[3][i] = 'wall';
                    for (let i = 3; i < 9; i++) newGrid[5][i] = 'wall';
                    for (let i = 2; i < 6; i++) newGrid[7][i] = 'wall';
                    for (let i = 0; i < 5; i++) newGrid[i][9] = 'wall';
                    
                    setTargetPosition({ x: 9, y: 9 });
                    break;
                    
                case 2:
                    setLevelDescription('ด่านที่ 2: เขาวงกตปานกลาง');
                    setLevelHint('เส้นทางอาจซับซ้อนขึ้น ระวังทางตัน');
                    
                    // More complex maze
                    for (let i = 1; i < 9; i += 2) {
                        for (let j = 0; j < 9; j++) {
                            if (j !== i) newGrid[i][j] = 'wall';
                        }
                    }
                    for (let i = 2; i < 8; i += 2) {
                        for (let j = 1; j < 10; j++) {
                            if (j !== 10-i) newGrid[i][j] = 'wall';
                        }
                    }
                    
                    setTargetPosition({ x: 9, y: 7 });
                    break;
                    
                case 3:
                    setLevelDescription('ด่านที่ 3: เขาวงกตซับซ้อน');
                    setLevelHint('ต้องใช้การวางแผนเส้นทางที่ดี หาทางลัดที่เหมาะสม');
                    
                    // Complex maze with more walls and paths
                    for (let i = 0; i < GRID_SIZE; i++) {
                        for (let j = 0; j < GRID_SIZE; j++) {
                            if ((i % 2 === 1 && j % 2 === 1) || 
                                (i % 3 === 0 && j % 3 === 0)) {
                                newGrid[i][j] = 'wall';
                            }
                        }
                    }
                    
                    // Create paths through the maze
                    for (let i = 0; i < 5; i++) {
                        newGrid[i][i*2] = 'path';
                        newGrid[i*2][GRID_SIZE-i-1] = 'path';
                    }
                    for (let i = 5; i < GRID_SIZE; i++) {
                        newGrid[i][GRID_SIZE-i] = 'path';
                    }
                    
                    setTargetPosition({ x: 9, y: 9 });
                    break;
                    
                case 4:
                    setLevelDescription('ด่านที่ 4: บททดสอบขั้นสุดท้าย');
                    setLevelHint('นี่คือบททดสอบสุดท้าย ต้องใช้ทักษะและความอดทนในการหาทางออก');
                    
                    // Final complex maze
                    // Initialize with all walls
                    for (let i = 0; i < GRID_SIZE; i++) {
                        for (let j = 0; j < GRID_SIZE; j++) {
                            newGrid[i][j] = 'wall';
                        }
                    }
                    
                    // Create maze pattern using recursive backtracking pattern
                    // For simplicity, we'll just create a predefined pattern
                    const paths = [
                        [0,0], [0,1], [0,2], [1,2], [2,2], [2,3], [2,4], [3,4], [4,4],
                        [4,3], [4,2], [4,1], [4,0], [5,0], [6,0], [6,1], [6,2], [6,3],
                        [6,4], [6,5], [6,6], [5,6], [4,6], [3,6], [2,6], [2,7], [2,8],
                        [3,8], [4,8], [5,8], [6,8], [7,8], [8,8], [8,7], [8,6], [8,5],
                        [8,4], [8,3], [8,2], [8,1], [8,0], [9,0], [9,1], [9,2], [9,3],
                        [9,4], [9,5], [9,6], [9,7], [9,8], [9,9]
                    ];
                    
                    // Create paths
                    paths.forEach(([y, x]) => {
                        newGrid[y][x] = 'path';
                    });
                    
                    setTargetPosition({ x: 9, y: 9 });
                    break;
                    
                default:
                    setLevelDescription('ด่านทดสอบ');
                    setLevelHint('เดินไปยังเป้าหมาย');
                    setTargetPosition({ x: 9, y: 9 });
            }
            
            setGrid(newGrid);
            setCharacterPosition(getStartingPosition(level));
        };
        
        createMaze(currentLevel);
        setMovesCount(0);
    }, [currentLevel, GRID_SIZE]);
    
    useEffect(() => {
        if (onMount) onMount();
        
        // Start background music
        playBackgroundMusic();
        
        return () => {
            if (onUnmount) onUnmount();
            stopBackgroundMusic();
        };
    }, [onMount, onUnmount]);
    
    useEffect(() => {
        if (showGameComplete) {
            const student = JSON.parse(localStorage.getItem('student') || '{}');
            const studentId = student.student_id || student.id;
            if (studentId) {
                const totalStars = Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0);
                saveScoreToServer(studentId, 'mazeGame', totalScore, totalStars);
            }
        }
    }, [showGameComplete]);
    
    useEffect(() => {
        setElapsedTime(0);
        if (timerInterval) clearInterval(timerInterval);
        if (showGameComplete) return;
        
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        setTimerInterval(interval);
        
        return () => {
            clearInterval(interval);
            setTimerInterval(null);
        };
    }, [currentLevel, showGameComplete]);
    
    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showGameComplete) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    moveCharacter('up');
                    break;
                case 'ArrowDown':
                    moveCharacter('down');
                    break;
                case 'ArrowLeft':
                    moveCharacter('left');
                    break;
                case 'ArrowRight':
                    moveCharacter('right');
                    break;
                default:
                    return;
            }
            e.preventDefault();
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [characterPosition, grid, showGameComplete]);
    
    const goToHome = () => {
        stopBackgroundMusic();
        playSound('button.mp3');
        if (timerInterval) clearInterval(timerInterval);
        setTimerInterval(null);
        navigate('/student-dashboard');
    };
    
    const playSound = (file) => {
        const audio = new Audio(process.env.PUBLIC_URL + '/sounds/' + file);
        audio.play();
    };
    
    const playBackgroundMusic = () => {
        if (!backgroundMusic) {
            const music = new Audio(process.env.PUBLIC_URL + '/sounds/MV.mp3');
            music.loop = true;
            music.volume = 0.1;
            setBackgroundMusic(music);
            music.play();
            setIsMusicPlaying(true);
        } else if (!isMusicPlaying) {
            backgroundMusic.play();
            setIsMusicPlaying(true);
        }
    };
    
    const stopBackgroundMusic = () => {
        if (backgroundMusic && isMusicPlaying) {
            backgroundMusic.pause();
            setIsMusicPlaying(false);
        }
    };
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="maze-game">
            <div className="game-header">
                <h2>เกมเขาวงกต</h2>
                <div className="level-info">
                    <div className="level-indicator">
                        ด่านที่ {currentLevel} / 4
                    </div>
                    <div className="score-display">
                        คะแนนรวม: {totalScore}
                    </div>
                    <div className="moves-display">
                        จำนวนการเดิน: {movesCount}
                    </div>
                    <div className="timer-display" style={{ marginLeft: 16, fontWeight: 'bold', color: elapsedTime > getOptimalTime(currentLevel) ? '#d32f2f' : '#1976d2', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 4 }}>⏱️</span> {formatTime(elapsedTime)}
                    </div>
                </div>
                <div className="level-description">
                    {levelDescription}
                </div>
            </div>

            <div className="game-container">
                <div className="maze-board" style={{ width: GRID_SIZE * CELL_SIZE + 'px', height: GRID_SIZE * CELL_SIZE + 'px' }}>
                    {grid.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid-row">
                            {row.map((cell, colIndex) => (
                                <div 
                                    key={`${rowIndex}-${colIndex}`} 
                                    className={`grid-cell ${cell}`}
                                    style={{ width: CELL_SIZE + 'px', height: CELL_SIZE + 'px' }}
                                />
                            ))}
                        </div>
                    ))}
                    <div 
                        className="character"
                        style={{
                            left: `${characterPosition.x * CELL_SIZE}px`,
                            top: `${characterPosition.y * CELL_SIZE}px`,
                            width: CELL_SIZE + 'px',
                            height: CELL_SIZE + 'px'
                        }}
                    >
                        👨‍💻
                    </div>
                    <div 
                        className="target"
                        style={{
                            left: `${targetPosition.x * CELL_SIZE}px`,
                            top: `${targetPosition.y * CELL_SIZE}px`,
                            width: CELL_SIZE + 'px',
                            height: CELL_SIZE + 'px'
                        }}
                    >
                        🎯
                    </div>
                </div>

                <div className="control-panel">
                    <div className="hint-section">
                        <button onClick={toggleHint} className="hint-button">
                            {showHint ? "ซ่อนคำแนะนำ" : "แสดงคำแนะนำ"}
                        </button>
                        {showHint && (
                            <div className="hint-box">
                                {levelHint}
                            </div>
                        )}
                    </div>

                    <div className="movement-controls">
                        <button 
                            onClick={() => moveCharacter('up')}
                            className="direction-btn up"
                        >
                            ⬆️
                        </button>
                        <div className="horizontal-controls">
                            <button 
                                onClick={() => moveCharacter('left')}
                                className="direction-btn left"
                            >
                                ⬅️
                            </button>
                            <button 
                                onClick={() => moveCharacter('right')}
                                className="direction-btn right"
                            >
                                ➡️
                            </button>
                        </div>
                        <button 
                            onClick={() => moveCharacter('down')}
                            className="direction-btn down"
                        >
                            ⬇️
                        </button>
                    </div>

                    <div className="game-buttons">
                        <button 
                            onClick={resetGame}
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

            {showGameComplete && (
                <div className="game-complete-modal">
                    <div className="game-complete-content">
                        <h2>🏆 ยินดีด้วย! คุณผ่านเกมเขาวงกตแล้ว 🏆</h2>
                        <div className="game-complete-details">
                            <p className="complete-score">คะแนนรวมทั้งหมด: <span>{totalScore}</span> คะแนน</p>
                            <p>คุณผ่านทั้ง 4 ด่านเรียบร้อยแล้ว!</p>
                            <div className="stars-summary" style={{ textAlign: 'center', margin: '24px 0' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 8, color: '#7c4dff', letterSpacing: 1 }}>
                                    ⭐ ดาวสะสม ⭐
                                </div>
                                <div style={{ fontSize: '2.5rem', letterSpacing: 2 }}>
                                    {Array.from({ length: Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0) }).map((_, i) => (
                                        <span key={i} style={{ color: '#FFD700', textShadow: '0 0 8px #fff200' }}>★</span>
                                    ))}
                                    {Array.from({ length: 16 - Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0) }).map((_, i) => (
                                        <span key={i + Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0)} style={{ color: '#e0e0e0' }}>★</span>
                                    ))}
                                </div>
                                <div style={{ marginTop: 8, fontSize: '1.1rem', color: '#333' }}>
                                    {Object.values(starsPerLevel).reduce((sum, s) => sum + s, 0)} / 16 ดาว
                                </div>
                            </div>
                            <div className="used-time-summary" style={{ marginTop: 16 }}>
                                <h4>เวลาที่ใช้แต่ละด่าน:</h4>
                                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                                    {Object.entries(usedTimePerLevel).map(([level, time]) => (
                                        <li key={level}>ด่าน {level}: {formatTime(time)}</li>
                                    ))}
                                </ul>
                            </div>
                            <p>ความสามารถในการแก้ปัญหาของคุณยอดเยี่ยมมาก</p>
                        </div>
                        <div className="game-complete-buttons">
                            <button 
                                onClick={() => {
                                    setCurrentLevel(1);
                                    setScore(0);
                                    setTotalScore(0);
                                    setShowGameComplete(false);
                                    setMovesCount(0);
                                    setCharacterPosition(getStartingPosition(1));
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

export default MazeGame;