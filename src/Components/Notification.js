import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './Notification.css';

const Notification = () => {
    const { notifications, removeNotification } = useNotification();
    const [animatingIds, setAnimatingIds] = useState([]);
    const [shownNotifications, setShownNotifications] = useState(new Set());

    // จัดการการ Animate ออกก่อนลบ
    const handleRemove = (id) => {
        setAnimatingIds((prev) => [...prev, id]);
        
        // รอให้ Animation เล่นจบก่อนลบ
        setTimeout(() => {
            removeNotification(id);
            setAnimatingIds((prev) => prev.filter((animId) => animId !== id));
            // ลบ ID ออกจากชุดที่แสดงแล้ว
            setShownNotifications((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }, 300);
    };

    // เพิ่มไอคอนตามประเภทการแจ้งเตือน
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    // กรองเฉพาะการแจ้งเตือนที่ยังไม่เคยแสดง
    const uniqueNotifications = notifications.filter(notification => {
        if (shownNotifications.has(notification.id)) {
            return false;
        }
        setShownNotifications(prev => new Set([...prev, notification.id]));
        return true;
    });

    if (uniqueNotifications.length === 0) {
        return null;
    }

    return (
        <div className="notification-container">
            {uniqueNotifications.map((notification) => (
                <div 
                    key={notification.id} 
                    className={`notification-item ${notification.type} ${
                        animatingIds.includes(notification.id) ? 'fade-out' : ''
                    }`}
                    onClick={() => handleRemove(notification.id)}
                >
                    <div className="notification-icon">
                        {getIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                    </div>
                    <button 
                        className="notification-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(notification.id);
                        }}
                        aria-label="ปิดการแจ้งเตือน"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notification;