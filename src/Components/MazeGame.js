import React, { useState, useEffect, useRef } from 'react';

export default function MazeGame() {
  const [gameState, setGameState] = useState({
    currentLevel: 0,
    isPlaying: false,
    gameCompleted: false,
    startTime: null,
    endTime: null,
    scores: [0, 0, 0, 0],
    playerName: '',
    leaderboard: JSON.parse(localStorage.getItem('mazeLeaderboard') || '[]'),
    moveCount: 0,
    showInstructions: true
  });

  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [message, setMessage] = useState('');
  const playerRef = useRef(null);
  const mazeRef = useRef(null);

  // 4 ระดับเขาวงกต (0: ง่าย, 1: ปานกลาง, 2: ยาก, 3: มาสเตอร์)
  const levels = [
    {
      name: "ด่านที่ 1: เขาวงกตเริ่มต้น",
      grid: [
        [0, 0, 1, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 1, 1, 0],
        [1, 0, 0, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 1, 0],
        [1, 0, 1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 2],
      ],
      start: { x: 0, y: 0 },
      goal: { x: 7, y: 7 },
      timeLimit: 30,
    },
    {
      name: "ด่านที่ 2: เขาวงกตแห่งความท้าทาย",
      grid: [
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 1, 0, 1, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
        [2, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      ],
      start: { x: 0, y: 0 },
      goal: { x: 0, y: 9 },
      timeLimit: 45,
    },
    {
      name: "ด่านที่ 3: เขาวงกตยอดปัญญา",
      grid: [
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1],
      ],
      start: { x: 0, y: 0 },
      goal: { x: 8, y: 11 },
      timeLimit: 60,
    },
    {
      name: "ด่านที่ 4: เขาวงกตมาสเตอร์",
      grid: [
        [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      ],
      start: { x: 0, y: 0 },
      goal: { x: 14, y: 14 },
      timeLimit: 90,
    },
  ];

  // คำนวณคะแนนเมื่อเล่นจบด่าน
  const calculateScore = (time, moveCount, levelIndex) => {
    const level = levels[levelIndex];
    const timeBonus = Math.max(0, level.timeLimit - time);
    const moveEfficiency = level.grid.length * level.grid[0].length / moveCount;
    return Math.floor((timeBonus * 10 + moveEfficiency * 100) * (levelIndex + 1));
  };

  // เริ่มเกม
  const startGame = () => {
    if (!gameState.playerName.trim()) {
      setMessage("กรุณาใส่ชื่อผู้เล่นก่อนเริ่มเกม");
      return;
    }
    
    const currentLevel = levels[gameState.currentLevel];
    setPlayerPosition({ ...currentLevel.start });
    setGameState({
      ...gameState,
      isPlaying: true,
      startTime: Date.now(),
      endTime: null,
      moveCount: 0,
      showInstructions: false
    });
    setMessage(`เริ่มเล่น ${currentLevel.name}`);
  };

  // จัดการการเคลื่อนที่
  const handleKeyDown = (e) => {
    if (!gameState.isPlaying) return;

    e.preventDefault();
    
    const level = levels[gameState.currentLevel];
    const grid = level.grid;
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (e.key) {
      case 'ArrowUp':
        newY = Math.max(0, playerPosition.y - 1);
        break;
      case 'ArrowDown':
        newY = Math.min(grid.length - 1, playerPosition.y + 1);
        break;
      case 'ArrowLeft':
        newX = Math.max(0, playerPosition.x - 1);
        break;
      case 'ArrowRight':
        newX = Math.min(grid[0].length - 1, playerPosition.x + 1);
        break;
      default:
        return;
    }

    // ตรวจสอบว่าช่องใหม่ไม่ใช่กำแพง
    if (grid[newY][newX] !== 1) {
      setPlayerPosition({ x: newX, y: newY });
      setGameState(prev => ({
        ...prev,
        moveCount: prev.moveCount + 1
      }));
      
      // ตรวจสอบว่าถึงเป้าหมายหรือไม่
      if (grid[newY][newX] === 2) {
        completeLevel();
      }
    }
  };

  // จัดการเมื่อเล่นจบด่าน
  const completeLevel = () => {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - gameState.startTime) / 1000);
    const levelScore = calculateScore(timeElapsed, gameState.moveCount, gameState.currentLevel);

    const newScores = [...gameState.scores];
    newScores[gameState.currentLevel] = levelScore;

    if (gameState.currentLevel === levels.length - 1) {
      // เล่นครบทุกด่านแล้ว
      const totalScore = newScores.reduce((sum, score) => sum + score, 0);
      const newLeaderboard = [...gameState.leaderboard, {
        name: gameState.playerName,
        score: totalScore,
        date: new Date().toLocaleDateString()
      }].sort((a, b) => b.score - a.score).slice(0, 10);
      
      localStorage.setItem('mazeLeaderboard', JSON.stringify(newLeaderboard));
      
      setGameState({
        ...gameState,
        isPlaying: false,
        gameCompleted: true,
        scores: newScores,
        endTime,
        leaderboard: newLeaderboard
      });
      
      setMessage(`ยินดีด้วย! คุณผ่านทุกด่านแล้ว คะแนนรวม: ${totalScore}`);
    } else {
      // ไปด่านต่อไป
      const nextLevel = gameState.currentLevel + 1;
      setMessage(`ยอดเยี่ยม! คุณผ่านด่านที่ ${gameState.currentLevel + 1} ด้วยคะแนน ${levelScore} แต้ม`);
      
      setGameState({
        ...gameState,
        currentLevel: nextLevel,
        isPlaying: false,
        scores: newScores,
        endTime
      });
    }
  };

  // ไปด่านต่อไป
  const nextLevel = () => {
    const currentLevel = levels[gameState.currentLevel];
    setPlayerPosition({ ...currentLevel.start });
    setGameState({
      ...gameState,
      isPlaying: true,
      startTime: Date.now(),
      endTime: null,
      moveCount: 0
    });
    setMessage(`เริ่มเล่น ${currentLevel.name}`);
  };

  // เริ่มเกมใหม่
  const restartGame = () => {
    setGameState({
      ...gameState,
      currentLevel: 0,
      isPlaying: false,
      gameCompleted: false,
      startTime: null,
      endTime: null,
      scores: [0, 0, 0, 0],
      moveCount: 0
    });
    setMessage("");
  };

  // จัดการควบคุมด้วยปุ่มบนหน้าจอ
  const handleDirectionClick = (direction) => {
    const keyEvent = { key: direction, preventDefault: () => {} };
    handleKeyDown(keyEvent);
  };

  // คำนวณเวลาที่เหลือ
  const [timeLeft, setTimeLeft] = useState(null);
  
  useEffect(() => {
    const handleKeyPress = (e) => handleKeyDown(e);
    window.addEventListener('keydown', handleKeyPress);
    
    // เพิ่ม focus ให้กับ player element เพื่อให้การควบคุมด้วยคีย์บอร์ดทำงานได้
    if (playerRef.current) {
      playerRef.current.focus();
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [playerPosition, gameState.isPlaying]);

  useEffect(() => {
    let timer;
    if (gameState.isPlaying) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const currentTimeLimit = levels[gameState.currentLevel].timeLimit;
        const remaining = Math.max(0, currentTimeLimit - elapsed);
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
          setMessage("หมดเวลา! ลองใหม่อีกครั้ง");
          setGameState(prev => ({
            ...prev,
            isPlaying: false
          }));
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isPlaying, gameState.startTime]);

  const renderMaze = () => {
    if (!gameState.isPlaying && !gameState.endTime) return null;

    const level = levels[gameState.currentLevel];
    const grid = level.grid;
    
    return (
      <div className="maze-container" ref={mazeRef}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="maze-row">
            {row.map((cell, colIndex) => {
              let cellClass = "maze-cell";
              if (cell === 1) cellClass += " wall";
              if (cell === 2) cellClass += " goal";
              if (playerPosition.x === colIndex && playerPosition.y === rowIndex)
                cellClass += " player";
                
              return <div key={colIndex} className={cellClass} />;
            })}
          </div>
        ))}
        <div 
          className="player" 
          style={{ 
            left: `${playerPosition.x * 30}px`,
            top: `${playerPosition.y * 30}px`
          }}
          ref={playerRef}
          tabIndex={0}
        />
      </div>
    );
  };

  const renderControls = () => {
    if (!gameState.isPlaying) return null;
    
    return (
      <div className="controls">
        <div className="direction-pad">
          <button onClick={() => handleDirectionClick('ArrowUp')} className="direction-button up">
            ↑
          </button>
          <div className="horizontal-buttons">
            <button onClick={() => handleDirectionClick('ArrowLeft')} className="direction-button left">
              ←
            </button>
            <button onClick={() => handleDirectionClick('ArrowRight')} className="direction-button right">
              →
            </button>
          </div>
          <button onClick={() => handleDirectionClick('ArrowDown')} className="direction-button down">
            ↓
          </button>
        </div>
      </div>
    );
  };

  const renderGameInfo = () => {
    if (!gameState.isPlaying && !gameState.endTime) return null;
    
    return (
      <div className="game-info">
        <div className="level-info">ด่านที่: {gameState.currentLevel + 1}/4</div>
        <div className="time-info">เวลา: {timeLeft !== null ? timeLeft : '--'} วินาที</div>
        <div className="moves-info">จำนวนก้าว: {gameState.moveCount}</div>
      </div>
    );
  };

  const renderLevelComplete = () => {
    if (gameState.isPlaying || !gameState.endTime || gameState.gameCompleted) return null;
    
    const timeElapsed = Math.floor((gameState.endTime - gameState.startTime) / 1000);
    
    return (
      <div className="level-complete">
        <h2>ผ่านด่านที่ {gameState.currentLevel + 1} แล้ว!</h2>
        <p>เวลาที่ใช้: {timeElapsed} วินาที</p>
        <p>จำนวนก้าว: {gameState.moveCount}</p>
        <p>คะแนน: {gameState.scores[gameState.currentLevel]}</p>
        <button onClick={nextLevel} className="next-button">
          ไปด่านที่ {gameState.currentLevel + 2}
        </button>
      </div>
    );
  };
  
  const renderGameComplete = () => {
    if (!gameState.gameCompleted) return null;
    
    const totalScore = gameState.scores.reduce((sum, score) => sum + score, 0);
    
    return (
      <div className="game-complete">
        <h2>ยินดีด้วย! คุณเล่นผ่านทั้งหมดแล้ว</h2>
        <h3>ผลคะแนนของคุณ: {gameState.playerName}</h3>
        {levels.map((level, index) => (
          <div key={index} className="level-score">
            <span>ด่านที่ {index + 1}: {gameState.scores[index]} แต้ม</span>
          </div>
        ))}
        <div className="total-score">คะแนนรวม: {totalScore}</div>
        
        <h3>อันดับสูงสุด</h3>
        <div className="leaderboard">
          {gameState.leaderboard.map((entry, index) => (
            <div key={index} className="leaderboard-entry">
              <span>{index + 1}. {entry.name} - {entry.score} แต้ม ({entry.date})</span>
            </div>
          ))}
        </div>
        
        <button onClick={restartGame} className="restart-button">
          เล่นใหม่อีกครั้ง
        </button>
      </div>
    );
  };

  const renderInstructions = () => {
    if (!gameState.showInstructions) return null;
    
    return (
      <div className="instructions">
        <h2>คำแนะนำในการเล่น</h2>
        <p>1. ใช้ปุ่มลูกศร (↑ ↓ ← →) หรือปุ่มบนหน้าจอเพื่อเคลื่อนที่</p>
        <p>2. หลีกเลี่ยงกำแพง (สีดำ) และหาทางไปยังเป้าหมาย (สีเขียว)</p>
        <p>3. มีเวลาจำกัดในแต่ละด่าน ยิ่งเร็วยิ่งได้คะแนนมาก</p>
        <p>4. ยิ่งใช้จำนวนก้าวน้อยยิ่งได้คะแนนมาก</p>
        <p>5. มีทั้งหมด 4 ด่าน แต่ละด่านจะมีความยากเพิ่มขึ้น</p>
        <button onClick={() => setGameState({...gameState, showInstructions: false})}>
          เข้าใจแล้ว
        </button>
      </div>
    );
  };

  return (
    <div className="game-container">
      <h1 className="game-title">เกมเขาวงกตท้าทายปัญญา</h1>
      
      {renderInstructions()}
      
      {!gameState.isPlaying && !gameState.endTime && !gameState.gameCompleted && !gameState.showInstructions && (
        <div className="start-screen">
          <input
            type="text"
            placeholder="ชื่อผู้เล่น"
            value={gameState.playerName}
            onChange={(e) => setGameState({...gameState, playerName: e.target.value})}
            className="player-name-input"
          />
          <button onClick={startGame} className="start-button">
            เริ่มเกม
          </button>
          {message && <div className="message">{message}</div>}
        </div>
      )}
      
      {renderGameInfo()}
      {renderMaze()}
      {renderControls()}
      {renderLevelComplete()}
      {renderGameComplete()}
      
      <style jsx>{`
        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Kanit', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        
        .game-title {
          color: #3949ab;
          text-align: center;
          margin-bottom: 20px;
          font-size: 2rem;
        }
        
        .maze-container {
          position: relative;
          background-color: #e0e0e0;
          border: 2px solid #3949ab;
          border-radius: 5px;
          padding: 4px;
          margin: 10px 0;
        }
        
        .maze-row {
          display: flex;
        }
        
        .maze-cell {
          width: 30px;
          height: 30px;
          box-sizing: border-box;
        }
        
        .wall {
          background-color: #212121;
        }
        
        .goal {
          background-color: #4caf50;
          animation: pulse 1.5s infinite;
        }
        
        .player {
          position: absolute;
          width: 30px;
          height: 30px;
          background-color: #f44336;
          border-radius: 50%;
          z-index: 10;
          transition: left 0.1s, top 0.1s;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        }
        
        .game-info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 10px;
          background-color: #e3f2fd;
          border-radius: 5px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .controls {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          width: 100%;
        }
        
        .direction-pad {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .horizontal-buttons {
          display: flex;
          gap: 20px;
        }
        
        .direction-button {
          width: 60px;
          height: 60px;
          background-color: #3949ab;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 24px;
          cursor: pointer;
          margin: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background-color 0.2s;
        }
        
        .direction-button:hover {
          background-color: #303f9f;
        }
        
        .direction-button:active {
          background-color: #1a237e;
          transform: scale(0.95);
        }
        
        .player-name-input {
          padding: 10px;
          font-size: 16px;
          border: 2px solid #3949ab;
          border-radius: 5px;
          margin-bottom: 10px;
          width: 100%;
          max-width: 300px;
        }
        
        .start-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 20px 0;
        }
        
        .start-button, .next-button, .restart-button {
          padding: 12px 24px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.2s;
          margin: 10px 0;
        }
        
        .start-button:hover, .next-button:hover, .restart-button:hover {
          background-color: #388e3c;
        }
        
        .level-complete, .game-complete {
          text-align: center;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          margin: 20px 0;
          width: 100%;
          max-width: 400px;
        }
        
        .message {
          color: #e53935;
          margin-top: 10px;
          font-weight: bold;
        }
        
        .leaderboard {
          margin-top: 10px;
          text-align: left;
          background-color: #e3f2fd;
          padding: 10px;
          border-radius: 5px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .leaderboard-entry {
          padding: 5px;
          border-bottom: 1px solid #bbdefb;
        }
        
        .total-score {
          font-size: 24px;
          font-weight: bold;
          color: #3949ab;
          margin: 15px 0;
        }
        
        .level-score {
          margin: 5px 0;
        }
        
        .instructions {
          background-color: rgba(255, 255, 255, 0.95);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          margin: 10px 0;
          max-width: 600px;
          text-align: left;
        }
        
        .instructions h2 {
          color: #3949ab;
          text-align: center;
          margin-bottom: 15px;
        }
        
        .instructions p {
          margin: 10px 0;
          line-height: 1.5;
        }
        
        .instructions button {
          display: block;
          margin: 20px auto 0;
          padding: 10px 20px;
          background-color: #3949ab;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .instructions button:hover {
          background-color: #303f9f;
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        
        @media (max-width: 600px) {
          .game-info {
            flex-direction: column;
            align-items: center;
          }
          
          .game-info div {
            margin: 5px 0;
          }
          
          .direction-button {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}