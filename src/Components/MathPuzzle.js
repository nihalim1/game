import React, { useState, useEffect } from 'react';
import './MathPuzzle.css';
import { useNotification } from '../contexts/NotificationContext';
import { saveGameProgress, getGameProgress } from '../utils/gameProgress';
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
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stars, setStars] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const { addNotification } = useNotification();
    const [showHintPopup, setShowHintPopup] = useState(false);
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [completedLevels, setCompletedLevels] = useState(0);
    const [animating, setAnimating] = useState(false); // สถานะสำหรับอนิเมชัน
    const [totalStars, setTotalStars] = useState(0); // คะแนนดาวรวมทั้งหมด
    const [highestScore, setHighestScore] = useState(0); // คะแนนสูงสุด

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
            title: "ด่านที่ 2: ลำดับง่ายๆ",
            question: "จงหาตัวเลขถัดไปของลำดับ: 2, 4, 6, 8, ...",
            answer: "10",
            hint: "แต่ละตัวเลขเพิ่มขึ้นทีละ 2",
            timeLimit: 30,
            points: 150
        },
        // ... ข้อมูลด่านอื่นๆ คงเดิม ...
        {
            title: "ด่านที่ 20: สมการง่ายๆ",
            question: "ถ้า x + 5 = 12 แล้ว x มีค่าเท่ากับเท่าไร?",
            answer: "7",
            hint: "หาค่า x โดยลบ 5 ออกจากทั้งสองข้างของสมการ",
            timeLimit: 150,
            points: 1000
        }
    ];

    // ดึงความก้าวหน้าจาก localStorage เมื่อโหลดเกม
    useEffect(() => {
        const progress = getGameProgress('mathPuzzle');
        if (progress.completedLevels > 0) {
            setCompletedLevels(progress.completedLevels);
            // อนุญาตให้เลือกด่านที่เล่นได้ แต่เริ่มต้นจะอยู่ที่ด่านล่าสุด + 1
            setCurrentLevel(Math.min(progress.completedLevels + 1, 20));
        }
        
        // อัพเดทคะแนนและดาวจากข้อมูลที่บันทึกไว้
        if (progress.totalStars) setTotalStars(progress.totalStars);
        if (progress.highestScore) {
            setHighestScore(progress.highestScore);
            setScore(progress.highestScore);
        }

        // ตั้งค่าเวลาสำหรับด่านปัจจุบัน
        const currentLevelData = levels[currentLevel - 1];
        setTimeLeft(currentLevelData.timeLimit);
        setIsPlaying(true);
    }, []);

    // เมื่อเปลี่ยนด่าน
    useEffect(() => {
        if (currentLevel > 0) {
            setAnimating(true);
            const currentLevelData = levels[currentLevel - 1];
            setTimeLeft(currentLevelData.timeLimit);
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
            message: 'ลองใหม่อีกครั้ง',
            duration: 3000
        });
        
        // บันทึกประวัติกรณีหมดเวลา
        const currentLevelData = levels[currentLevel - 1];
        saveGameHistory(currentLevelData, answer || "(ไม่ได้ตอบ)", false, 0, 0, 0);
    };

    // คำนวณดาวจากเวลาที่ใช้
    const calculateStars = (timeLeft, totalTime) => {
        const timePercentage = (timeLeft / totalTime) * 100;
        
        if (timePercentage >= 70) return 5; // เหลือเวลา 70% ขึ้นไป = 5 ดาว
        if (timePercentage >= 50) return 4; // เหลือเวลา 50-69% = 4 ดาว
        if (timePercentage >= 30) return 3; // เหลือเวลา 30-49% = 3 ดาว
        if (timePercentage >= 10) return 2; // เหลือเวลา 10-29% = 2 ดาว
        return 1; // เหลือเวลาน้อยกว่า 10% = 1 ดาว
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
        
        if (isCorrect) {
            // คำนวณคะแนนและดาวที่ได้
            const earnedPoints = currentLevelData.points;
            const earnedStars = calculateStars(timeLeft, currentLevelData.timeLimit);
            
            const newScore = score + earnedPoints;
            setScore(newScore);
            setStars(earnedStars);
            setIsPlaying(false);
            
            // อัพเดทจำนวนดาวรวม
            const newTotalStars = totalStars + earnedStars;
            setTotalStars(newTotalStars);
            
            // อัพเดทคะแนนสูงสุด
            if (newScore > highestScore) {
                setHighestScore(newScore);
            }
            
            // แสดงการแจ้งเตือน
            addNotification({
                type: 'success',
                title: '🎉 ถูกต้อง!',
                message: `+${earnedPoints} คะแนน, ${earnedStars} ดาว`,
                duration: 3000
            });
            
            // อัพเดทความก้าวหน้าเฉพาะเมื่อผ่านด่านที่สูงกว่าเดิม
            const newCompletedLevel = Math.max(completedLevels, currentLevel);
            setCompletedLevels(newCompletedLevel);
            
            // บันทึกความก้าวหน้า
            saveGameProgress('mathPuzzle', {
                completedLevels: newCompletedLevel,
                totalStars: newTotalStars,
                highestScore: Math.max(highestScore, newScore)
            });
            
            // บันทึกประวัติการเล่น
            saveGameHistory(currentLevelData, answer, true, timeLeft, earnedPoints, earnedStars);
            
            // ตรวจสอบว่าเป็นด่านสุดท้ายหรือไม่
            if (currentLevel < 20) {
                setTimeout(() => {
                    setCurrentLevel(prev => prev + 1);
                    setAnswer('');
                    setIsPlaying(true);
                }, 2000);
            } else {
                // จบเกม
                setGameCompleted(true);
                addNotification({
                    type: 'success',
                    title: '🏆 ยินดีด้วย!',
                    message: 'คุณเล่นจบเกมแล้ว! คะแนนรวม: ' + newScore,
                    duration: 5000
                });
            } 
        } else {
            // ตอบผิด
            addNotification({
                type: 'error',
                title: '❌ ไม่ถูกต้อง',
                message: 'ลองอีกครั้ง',
                duration: 3000
            });
            
            // บันทึกประวัติการเล่น (กรณีตอบผิด)
            saveGameHistory(currentLevelData, answer, false, timeLeft, 0, 0);
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
        setTimeLeft(currentLevelData.timeLimit);
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
    const saveGameHistory = (levelData, userAnswer, isCorrect, usedTime, earnedPoints, earnedStars) => {
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
            hints: localStorage.getItem(`mathPuzzle_hint_level_${currentLevel}`) === 'true'
        };

        // ดึงประวัติเดิม
        let gameHistory = JSON.parse(localStorage.getItem('mathPuzzle_history') || '[]');
        
        // เพิ่มประวัติใหม่
        gameHistory.push(historyEntry);
        
        // จำกัดประวัติไม่เกิน 100 รายการ
        if (gameHistory.length > 100) {
            gameHistory = gameHistory.slice(-100);
        }
        
        // บันทึกลง localStorage
        localStorage.setItem('mathPuzzle_history', JSON.stringify(gameHistory));
        
        // บันทึกสถิติรวม
        updateGameStats(isCorrect, earnedPoints, earnedStars);
    };

    // อัปเดตสถิติรวม
    const updateGameStats = (isCorrect, points, stars) => {
        // ดึงสถิติเดิม
        let stats = JSON.parse(localStorage.getItem('mathPuzzle_stats') || '{}');
        
        // อัปเดตสถิติ
        stats.totalPlayed = (stats.totalPlayed || 0) + 1;
        stats.correctAnswers = (stats.correctAnswers || 0) + (isCorrect ? 1 : 0);
        stats.incorrectAnswers = (stats.incorrectAnswers || 0) + (isCorrect ? 0 : 1);
        stats.totalPoints = (stats.totalPoints || 0) + (isCorrect ? points : 0);
        stats.totalStars = (stats.totalStars || 0) + (isCorrect ? stars : 0);
        stats.lastPlayed = new Date().toISOString();
        
        // บันทึกลง localStorage
        localStorage.setItem('mathPuzzle_stats', JSON.stringify(stats));
    };

    return (
        <div className="math-puzzle">
            <div className={`game-header ${animating ? 'animate-fadein' : ''}`}>
                <h1>{getCurrentLevel().title}</h1>
                <div className="game-stats">
                    <div className="score-container">
                        <div className="score">คะแนน: {score}</div>
                        <div className="total-stars">ดาวสะสม: {totalStars}</div>
                    </div>
                    <div className={`timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
                        <span className="timer-icon">⏱️</span>
                        <span className="timer-text">{formatTime(timeLeft)}</span>
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

                        <form onSubmit={handleSubmit} className="answer-form">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="ใส่คำตอบ"
                                autoFocus
                                className="answer-input"
                            />
                            <div className="button-group">
                                <button type="submit" className="submit-button">ตอบ</button>
                                <button type="button" className="hint-button" onClick={showHint}>
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
                                </div>
                                <div className="game-over-buttons">
                                    <button 
                                        className="replay-button"
                                        onClick={() => {
                                            setCurrentLevel(1);
                                            setScore(0);
                                            setStars(0);
                                            setAnswer('');
                                            setIsPlaying(true);
                                            setGameCompleted(false);
                                            setTimeLeft(levels[0].timeLimit);
                                        }}
                                    >
                                        เล่นใหม่
                                    </button>
                                    <button 
                                        className="home-button"
                                        onClick={() => navigate('/student-dashboard')}
                                    >
                                        กลับสู่หน้าหลัก
                                    </button>
                                </div>
                            </div>
                        ) : timeLeft === 0 ? (
                            <>
                                <h2>⏰ หมดเวลา!</h2>
                                <button 
                                    className="retry-button"
                                    onClick={() => {
                                        const currentLevelData = levels[currentLevel - 1];
                                        setTimeLeft(currentLevelData.timeLimit);
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
                    onClick={() => setShowLevelSelector(true)}
                >
                    <span className="level-icon">🎮</span> เลือกด่าน
                </button>
                
                <button 
                    className="reset-button"
                    onClick={resetCurrentLevel}
                >
                    <span className="reset-icon">🔄</span> รีเซ็ตด่าน
                </button>

                <button 
                    className="home-button"
                    onClick={() => navigate('/student-dashboard')}
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
        </div>
    );
};

export default MathPuzzle;