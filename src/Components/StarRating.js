import React from 'react';
import '../styles/StarRating.css';

/**
 * StarRating component สำหรับแสดงคะแนนดาวในเกม
 * @param {Object} props
 * @param {number} props.rating - จำนวนดาวที่ได้รับ
 * @param {number} props.maxStars - จำนวนดาวสูงสุดที่เป็นไปได้ (ค่าเริ่มต้น: 5)
 * @param {boolean} props.showLabel - แสดงข้อความกำกับหรือไม่ (ค่าเริ่มต้น: false)
 * @param {string} props.labelText - ข้อความที่จะแสดง (ค่าเริ่มต้น: "ดาวที่ได้รับ:")
 * @returns {JSX.Element}
 */
const StarRating = ({ rating, maxStars = 5, showLabel = false, labelText = "ดาวที่ได้รับ:" }) => {
  return (
    <div className={showLabel ? "stars-earned" : ""}>
      {showLabel && <div className="stars-label">{labelText}</div>}
      <div className="star-rating">
        {Array.from({ length: maxStars }).map((_, index) => (
          <span 
            key={index} 
            className={`star ${index < rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

export default StarRating; 