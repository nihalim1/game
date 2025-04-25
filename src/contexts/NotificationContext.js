import React, { createContext, useContext, useState } from 'react';
import './NotificationContext.css'; // จะสร้างไฟล์นี้ในขั้นตอนต่อไป

const NotificationContext = createContext();

// คอมโพเนนต์สำหรับแสดงการแจ้งเตือน
const NotificationsDisplay = ({ notifications, removeNotification }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="notifications-container">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                    onClick={() => removeNotification(notification.id)}
                >
                    <div className="notification-header">
                        <div className="notification-title">{notification.title}</div>
                        <button 
                            className="notification-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                            }}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="notification-message">{notification.message}</div>
                </div>
            ))}
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // ฟังก์ชันเพิ่มการแจ้งเตือน
    const addNotification = (notification) => {
        const id = Date.now();
        
        // ตรวจสอบประเภทการแจ้งเตือน
        const type = notification.type || 'info';
        
        // ระยะเวลาที่แสดง
        const duration = notification.duration || 3000;
        
        const newNotification = { 
            ...notification, 
            id,
            type, 
            createdAt: new Date()
        };
        
        // จำกัดจำนวนการแจ้งเตือนไม่เกิน 5 รายการ
        setNotifications((prev) => {
            const limitedNotifications = prev.length >= 5 
                ? prev.slice(prev.length - 4) 
                : prev;
            return [...limitedNotifications, newNotification];
        });

        // ตั้งเวลาให้การแจ้งเตือนหายไปอัตโนมัติ
        setTimeout(() => {
            removeNotification(id);
        }, duration);
        
        return id;
    };

    // ฟังก์ชันลบการแจ้งเตือน
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };
    
    // ฟังก์ชันลบการแจ้งเตือนทั้งหมด
    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            addNotification, 
            removeNotification,
            clearNotifications 
        }}>
            {children}
            <NotificationsDisplay 
                notifications={notifications} 
                removeNotification={removeNotification} 
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext); 