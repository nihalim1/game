import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button 
            className="back-button"
            onClick={() => navigate(-1)}
        >
            <span className="back-icon">←</span>
            ย้อนกลับ
        </button>
    );
};

export default BackButton;