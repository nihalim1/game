import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameHistory.css';

const GAME_DETAILS = {
    codingGame: {
        icon: '💻',
        label: 'เกมโค้ดดิ้ง',
    },
    bridgeGame: {
        icon: '🌉',
        label: 'เกมสร้างสะพาน',
    },
    mathPuzzle: {
        icon: '🔢',
        label: 'เกม Math Puzzle',
    },
    mazeGame: {
        icon: '🎮',
        label: 'เกม Maze',
    },
};

const GameHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const student = JSON.parse(localStorage.getItem('student'));
    const studentId = student?.student_id;

    useEffect(() => {
        if (!studentId) return;
        fetch(`http://mgt2.pnu.ac.th/kong/app-game/get_scores.php?student_id=${studentId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(result => {
            if (result.success && Array.isArray(result.data)) {
                setHistory(result.data);
            } else {
                setHistory([]);
            }
        })
        .catch(() => setHistory([]));
    }, [studentId]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="game-history-container">
            <div className="history-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <span className="back-icon">←</span> ย้อนกลับ
                </button>
                <h2>ประวัติการเล่นเกม</h2>
            </div>
            <div className="history-list-card">
                {history.length === 0 && <div className="no-history">ไม่พบประวัติการเล่น</div>}
                {history.map((game, idx) => (
                    <div key={idx} className="history-card">
                        <div className="card-header">
                            <span className="game-icon-card">{GAME_DETAILS[game.game_type]?.icon || '🎮'}</span>
                            <span className="game-label-card">{GAME_DETAILS[game.game_type]?.label || game.game_type}</span>
                        </div>
                        <div className="card-body">
                            <div className="card-row">
                                <span className="score-card">คะแนน: <b>{game.score}</b></span>
                                <span className="stars-card">⭐ {game.stars}</span>
                            </div>
                            <div className="card-row date-card">
                                <span>{formatDate(game.created_at)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameHistory;