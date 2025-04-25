import React, { useState, useEffect } from 'react';
import './MatchingGame.css';
import { useNotification } from '../contexts/NotificationContext';
import { saveGameProgress, getGameProgress } from '../utils/gameProgress';
import { useNavigate } from 'react-router-dom';

// เพิ่มคอมโพเนนต์ LevelSelector สำหรับแสดงตัวเลือกด่าน
const LevelSelector = ({ currentLevel, completedLevels, onLevelSelect, onClose }) => {
    // กำหนดให้สามารถเลือกได้เฉพาะด่านที่เล่นผ่านแล้ว หรือด่านปัจจุบัน
    const availableLevels = Array.from({ length: completedLevels + 1 }, (_, i) => i + 1);
    
    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);
    
    return (
        <div className="level-selector-modal">
            <div className="level-selector-content">
                <div className="level-selector-header">
                    <h2>เลือกด่าน</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="level-list">
                    {availableLevels.map(level => (
                        <button 
                            key={level} 
                            className={`level-button ${level === currentLevel ? 'current' : ''}`} 
                            onClick={() => {
                                onLevelSelect(level);
                                onClose();
                            }}
                        >
                            ด่านที่ {level}
                            {level === currentLevel && <span className="current-marker"> (ปัจจุบัน)</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MatchingGame = () => {
    const [animals, setAnimals] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [score, setScore] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const [showLevelSelector, setShowLevelSelector] = useState(false);
    const [completedLevels, setCompletedLevels] = useState(0);

    // ข้อมูลสัตว์ทั้งหมด
    const allAnimalData = [
        // ด่าน 1-2: สัตว์พื้นฐาน
        { id: 1, name: 'เป็ด', type: 'สัตว์ปีก', image: 'https://img.pikbest.com/png-images/qiantu/hand-drawn-poultry-cartoon-duck-illustration_2724980.png!sw800' },
        { id: 2, name: 'แมว', type: 'สัตว์เลี้ยง', image: 'https://png.pngtree.com/png-clipart/20240915/original/pngtree-adorable-cartoon-kitten-png-image_16015737.png' },
        { id: 3, name: 'หอย', type: 'สัตว์น้ำ', image: 'https://www.pngbie.com/assets/images/icon/Pngbie-%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%9F%E0%B8%A3%E0%B8%B5-20230114214238.png' },
        { id: 4, name: 'ผึ้ง', type: 'แมลง', image: 'https://i.pinimg.com/736x/31/ab/28/31ab280403805c4c2f1a8c82c8c0705d.jpg' },
        // ด่าน 3-4: สัตว์เลี้ยง
        { id: 5, name: 'สุนัข', type: 'สัตว์เลี้ยง', image: 'https://cdn.pixabay.com/photo/2020/02/12/05/16/dog-cartoon-4841703_640.jpg' },
        { id: 6, name: 'กระต่าย', type: 'สัตว์เลี้ยง', image: 'https://img.pikbest.com/png-images/qianku/rabbit-animal-cute-hand-drawn-cartoon-pet-commercial-elements_1994414.png!sw800' },
        { id: 7, name: 'หนู', type: 'สัตว์เลี้ยง', image: 'https://png.pngtree.com/png-clipart/20230928/original/pngtree-standing-mouse-cartoon-png-image_13166049.png' },
        { id: 8, name: 'ปลาทอง', type: 'สัตว์น้ำ', image: 'https://img.pikbest.com/png-images/20241223/cute-cartoon-goldfish-big-expressive-eyes-orange-scales-flowing-fins-happy-smiling-_11289597.png!sw800' },
        // ด่าน 5-6: สัตว์ป่า
        { id: 9, name: 'สิงโต', type: 'สัตว์ป่า', image: 'https://i.pinimg.com/736x/53/d8/b7/53d8b7eea6a249e6c1689f5c73c517f6.jpg' },
        { id: 10, name: 'ช้าง', type: 'สัตว์ป่า', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkX8SscFKVhqP-gnV0ZAPby1Qbp_bZ6izc0w&s' },
        { id: 11, name: 'ยีราฟ', type: 'สัตว์ป่า', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPADSSZ9c-LJ5B_nZA6UOv5TEq_57l0hby_Q&s' },
        { id: 12, name: 'ม้าลาย', type: 'สัตว์ป่า', image: 'https://png.pngtree.com/png-vector/20240326/ourmid/pngtree-cute-zebra-cartoon-character-png-image_12241880.png' },
        // ด่าน 7-8: สัตว์น้ำ
        { id: 13, name: 'ปลาโลมา', type: 'สัตว์น้ำ', image: 'https://media.istockphoto.com/id/1472439830/th/%E0%B9%80%E0%B8%A7%E0%B8%84%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%95%E0%B8%B9%E0%B8%99%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B9%82%E0%B8%A5%E0%B8%A1%E0%B8%B2-%E0%B9%80%E0%B8%A7%E0%B8%81%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C.jpg?s=612x612&w=0&k=20&c=L8RKi2M_RETWfsN9NOxIBk8HpyFhJnJ9DQpMoT2SaEU=' },
        { id: 14, name: 'ปลาวาฬ', type: 'สัตว์น้ำ', image: 'https://i.pinimg.com/736x/ae/3e/f9/ae3ef932b388eaac1f7c94c4daa93b64.jpg' },
        { id: 15, name: 'ปลาฉลาม', type: 'สัตว์น้ำ', image: 'https://i.pinimg.com/736x/4f/f1/bf/4ff1bfc51182fe9b633d8de90fa38b59.jpg' },
        { id: 16, name: 'ปู', type: 'สัตว์น้ำ', image: 'https://i.pinimg.com/736x/fc/40/a8/fc40a8296427427a88b4bc682f6f7325.jpg' },
        // ด่าน 9-10: สัตว์แปลก
        { id: 17, name: 'จิงโจ้', type: 'สัตว์แปลก', image: 'https://img.pikbest.com/origin/10/09/62/45upIkbEsTxW6.png!sw800' },
        { id: 18, name: 'แพนกวิน', type: 'สัตว์แปลก', image: 'https://img.pikbest.com/png-images/20240814/cartoon-cute-baby-penguin-png-2_10723346.png!sw800' },
        { id: 19, name: 'โคอาล่า', type: 'สัตว์แปลก', image: 'https://png.pngtree.com/png-vector/20240202/ourlarge/pngtree-cartoon-koala-illustration-png-image_11584839.png' },
        { id: 20, name: 'นกฮูก', type: 'สัตว์ปีก', image: 'https://media.istockphoto.com/id/1187674673/th/%E0%B9%80%E0%B8%A7%E0%B8%84%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C/%E0%B8%99%E0%B8%81%E0%B8%AE%E0%B8%B9%E0%B8%81-%E0%B8%AB%E0%B8%B1%E0%B8%A7%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B1%E0%B8%95%E0%B8%A7%E0%B9%8C-%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%95%E0%B8%B9%E0%B8%99%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%A3%E0%B8%B1%E0%B8%81.jpg?s=612x612&w=0&k=20&c=WMENGMHDjWDjB56wYih8rlQu6mV-bKI8gZF_y1jn8a0=' },
    ];

    // กำหนดความยากของแต่ละด่าน
    const getLevelConfig = (level) => {
        switch(level) {
            case 1:
                return { pairs: 2, timeLimit: 30 }; // 4 การ์ด
            case 2:
                return { pairs: 3, timeLimit: 45 }; // 6 การ์ด
            case 3:
                return { pairs: 4, timeLimit: 60 }; // 8 การ์ด
            case 4:
                return { pairs: 5, timeLimit: 75 }; // 10 การ์ด
            case 5:
                return { pairs: 6, timeLimit: 90 }; // 12 การ์ด
            case 6:
                return { pairs: 7, timeLimit: 105 }; // 14 การ์ด
            case 7:
                return { pairs: 8, timeLimit: 120 }; // 16 การ์ด
            case 8:
                return { pairs: 9, timeLimit: 135 }; // 18 การ์ด
            case 9:
                return { pairs: 10, timeLimit: 150 }; // 20 การ์ด
            case 10:
                return { pairs: 12, timeLimit: 180 }; // 24 การ์ด
            default:
                return { pairs: 2, timeLimit: 30 };
        }
    };

    const [timeLeft, setTimeLeft] = useState(30);
    const [isGameActive, setIsGameActive] = useState(true);

    // ดึงความก้าวหน้าที่บันทึกไว้เมื่อโหลดเกม
    useEffect(() => {
        const progress = getGameProgress('matchingGame');
        if (progress.completedLevels > 0) {
            setCurrentLevel(progress.completedLevels);
            setCompletedLevels(progress.completedLevels);
        }
        if (progress.highestScore) {
            // อาจดึงคะแนนสูงสุดมาแสดงหรือใช้ในการคำนวณอื่นๆ
        }
    }, []);

    // สร้างการ์ดเกมตามด่าน
    useEffect(() => {
        const startNewLevel = () => {
            const config = getLevelConfig(currentLevel);
            const levelAnimals = allAnimalData
                .slice(0, config.pairs)
                .sort(() => Math.random() - 0.5);
            
            const shuffledPairs = [...levelAnimals, ...levelAnimals]
                .sort(() => Math.random() - 0.5)
                .map((card, index) => ({ ...card, uniqueId: index }));
            
            setAnimals(shuffledPairs);
            setTimeLeft(config.timeLimit);
            setMatchedPairs([]);
            setSelectedCards([]);
            setIsGameActive(true);
        };

        startNewLevel();
    }, [currentLevel]);

    // จัดการเวลา
    useEffect(() => {
        if (!isGameActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsGameActive(false);
                    addNotification({
                        type: 'error',
                        title: 'หมดเวลา!',
                        message: 'เริ่มใหม่อีกครั้ง'
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isGameActive, addNotification]);

    // จัดการการคลิกการ์ด
    const handleCardClick = (card) => {
        if (!isGameActive || selectedCards.length === 2 || 
            selectedCards.includes(card) || matchedPairs.includes(card.id)) {
            return;
        }

        const newSelected = [...selectedCards, card];
        setSelectedCards(newSelected);

        if (newSelected.length === 2) {
            if (newSelected[0].id === newSelected[1].id) {
                setMatchedPairs([...matchedPairs, card.id]);
                setScore(score + (currentLevel * 10));
                
                addNotification({
                    type: 'success',
                    title: 'จับคู่ถูกต้อง!',
                    message: `+${currentLevel * 10} คะแนน`
                });
                
                setSelectedCards([]);

                const config = getLevelConfig(currentLevel);
                if (matchedPairs.length + 1 === config.pairs) {
                    handleLevelComplete();
                }
            } else {
                setTimeout(() => {
                    setSelectedCards([]);
                }, 1000);
            }
        }
    };

    const handleLevelComplete = () => {
        setIsGameActive(false);
        
        // คำนวณคะแนนรวม
        const totalScore = score + (timeLeft * currentLevel);
        setScore(totalScore);
        
        if (currentLevel < 10) {
            addNotification({
                type: 'success',
                title: 'ผ่านด่าน!',
                message: `ยินดีด้วย! คุณผ่านด่านที่ ${currentLevel} แล้ว`
            });
            
            // ปรับปรุงด่านที่ผ่านแล้ว
            if (currentLevel > completedLevels) {
                setCompletedLevels(currentLevel);
            }
            
            setTimeout(() => {
                setCurrentLevel(prev => prev + 1);
            }, 1500);
        } else {
            addNotification({
                type: 'success',
                title: 'ชนะเกม!',
                message: 'ยินดีด้วย! คุณผ่านทุกด่านแล้ว'
            });
            
            // อัปเดตด่านที่ผ่านแล้ว
            setCompletedLevels(10);
        }
        
        // บันทึกความก้าวหน้า
        saveGameProgress('matchingGame', {
            completedLevels: Math.max(currentLevel, completedLevels),
            lastScore: totalScore,
            highestScore: Math.max(totalScore, getGameProgress('matchingGame').highestScore || 0),
            lastPlayTime: Date.now()
        });
    };

    // เพิ่มฟังก์ชันรีเซ็ตด่านปัจจุบัน
    const resetCurrentLevel = () => {
        setIsGameActive(true);
        const config = getLevelConfig(currentLevel);
        setTimeLeft(config.timeLimit);
        
        const levelAnimals = allAnimalData
            .slice(0, config.pairs)
            .sort(() => Math.random() - 0.5);
        
        const shuffledPairs = [...levelAnimals, ...levelAnimals]
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, uniqueId: index }));
        
        setAnimals(shuffledPairs);
        setMatchedPairs([]);
        setSelectedCards([]);
        
        addNotification({
            type: 'info',
            title: 'รีเซ็ตด่าน',
            message: `เริ่มเล่นด่านที่ ${currentLevel} ใหม่`
        });
    };
    
    // ฟังก์ชันเลือกด่านที่ต้องการเล่น
    const handleLevelSelect = (level) => {
        if (level <= completedLevels + 1) {
            setCurrentLevel(level);
            
            addNotification({
                type: 'info',
                title: 'เปลี่ยนด่าน',
                message: `เปลี่ยนไปเล่นด่านที่ ${level}`
            });
        }
    };
    
    // เพิ่มฟังก์ชันกลับหน้าหลัก
    const goToHome = () => {
        navigate('/student-dashboard');
    };

    return (
        <div className="matching-game">
            <div className="game-header">
                <h1>เกมจับคู่สัตว์ - ด่านที่ {currentLevel}</h1>
                <div className="game-stats">
                    <div className="score">คะแนน: {score}</div>
                    <div className="timer">เวลา: {timeLeft} วินาที</div>
                </div>
            </div>

            <div className={`game-grid level-${currentLevel}`}>
                {animals.map((animal) => (
                    <div
                        key={animal.uniqueId}
                        className={`card ${
                            selectedCards.includes(animal) ? 'flipped' : ''
                        } ${matchedPairs.includes(animal.id) ? 'matched' : ''}`}
                        onClick={() => handleCardClick(animal)}
                    >
                        <div className="card-inner">
                            <div className="card-front">
                                <span>?</span>
                            </div>
                            <div className="card-back">
                                <img src={animal.image} alt={animal.name} />
                                <div className="card-info">
                                    <h3>{animal.name}</h3>
                                    <p>{animal.type}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="game-controls">
                <button 
                    className="reset-button"
                    onClick={resetCurrentLevel}
                >
                    รีเซ็ตด่าน
                </button>

                <button 
                    className="level-select-button" 
                    onClick={() => setShowLevelSelector(true)}
                >
                    เลือกด่าน
                </button>

                <button 
                    className="home-button"
                    onClick={goToHome}
                >
                    กลับหน้าหลัก
                </button>
            </div>

            {!isGameActive && timeLeft === 0 && (
                <button 
                    className="retry-button"
                    onClick={() => {
                        setIsGameActive(true);
                        const config = getLevelConfig(currentLevel);
                        setTimeLeft(config.timeLimit);
                    }}
                >
                    เล่นใหม่
                </button>
            )}

            {/* โมดัลเลือกด่าน */}
            {showLevelSelector && (
                <LevelSelector 
                    currentLevel={currentLevel}
                    completedLevels={completedLevels} 
                    onLevelSelect={handleLevelSelect}
                    onClose={() => setShowLevelSelector(false)}
                />
            )}
        </div>
    );
};

export default MatchingGame;