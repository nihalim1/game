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
    const [shownNotificationKeys, setShownNotificationKeys] = useState(new Set());
    let notificationCounter = 0;

    // ฟังก์ชันเพิ่มการแจ้งเตือน
    const addNotification = (notification) => {
        // สร้าง unique key จาก title และ message
        const notificationKey = `${notification.title}-${notification.message}`;
        
        // ตรวจสอบว่าการแจ้งเตือนนี้เคยแสดงไปแล้วหรือไม่
        if (shownNotificationKeys.has(notificationKey)) {
            return null;
        }

        notificationCounter += 1;
        const id = `${Date.now()}-${notificationCounter}`;
        
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
        
        // เพิ่ม key ลงในชุดที่แสดงแล้ว
        setShownNotificationKeys(prev => new Set([...prev, notificationKey]));
        
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
            // ลบ key ออกจากชุดที่แสดงแล้วหลังจากเวลาผ่านไป
            setShownNotificationKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationKey);
                return newSet;
            });
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
        setShownNotificationKeys(new Set());
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