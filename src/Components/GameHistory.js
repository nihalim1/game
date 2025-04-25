import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameHistory.css';

const GameHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        totalGames: 0,
        averageStars: 0,
        bestTime: null,
        totalScore: 0
    });

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const savedHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];
        setHistory(savedHistory);

        // คำนวณสถิติ
        if (savedHistory.length > 0) {
            const totalGames = savedHistory.length;
            const totalStars = savedHistory.reduce((sum, game) => sum + game.stars, 0);
            const totalScore = savedHistory.reduce((sum, game) => sum + game.score, 0);
            const bestTime = Math.min(...savedHistory.map(game => game.timeUsed));

            setStats({
                totalGames,
                averageStars: (totalStars / totalGames).toFixed(1),
                bestTime,
                totalScore
            });
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="game-history-container">
            <div className="history-header">
                <button 
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <span className="back-icon">←</span>
                    ย้อนกลับ
                </button>
                <h2>สถิติการเล่นเกม</h2>
            </div>
            
            <div className="stats-container">
                <div className="stat-box">
                    <h3>เกมที่เล่นทั้งหมด</h3>
                    <p>{stats.totalGames} เกม</p>
                </div>
                <div className="stat-box">
                    <h3>ดาวเฉลี่ย</h3>
                    <p>{stats.averageStars} ⭐</p>
                </div>
                <div className="stat-box">
                    <h3>เวลาที่ดีที่สุด</h3>
                    <p>{stats.bestTime ? `${stats.bestTime} วินาที` : '-'}</p>
                </div>
                <div className="stat-box">
                    <h3>คะแนนรวม</h3>
                    <p>{stats.totalScore} คะแนน</p>
                </div>
            </div>

            <h3>ประวัติการเล่น</h3>
            <div className="history-list">
                {history.map((game, index) => (
                    <div key={index} className="history-item">
                        <div className="history-header">
                            <span className="level">ด่าน {game.level}</span>
                            <span className="date">{formatDate(game.timestamp)}</span>
                        </div>
                        <div className="history-details">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < game.stars ? 'star filled' : 'star'}>
                                        ★
                                    </span>
                                ))}
                            </div>
                            <div className="game-info">
                                <span>คะแนน: {game.score}</span>
                                <span>เวลาที่ใช้: {game.timeUsed} วินาที</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameHistory;