import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Progress.css';

const Progress = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [currentStudent, setCurrentStudent] = useState(null);

    useEffect(() => {
        // โหลดข้อมูลนักเรียนทั้งหมดจาก localStorage
        const savedStudents = localStorage.getItem('studentsProgress');
        if (savedStudents) {
            const parsedStudents = JSON.parse(savedStudents);
            setStudents(parsedStudents);
            
            // ถ้ามีนักเรียนอยู่ในระบบให้เลือกคนแรกเป็นค่าเริ่มต้น
            if (parsedStudents.length > 0) {
                setSelectedStudentId(parsedStudents[0].id);
            }
        }
    }, []);

    useEffect(() => {
        // อัพเดทข้อมูลนักเรียนที่เลือกเมื่อมีการเปลี่ยนแปลง
        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                setCurrentStudent(student);
            }
        }
    }, [selectedStudentId, students]);

    const calculatePercentage = () => {
        if (!currentStudent) return 0;
        return Math.round((currentStudent.completedLevels / currentStudent.totalLevels) * 100);
    };

    const handleStudentChange = (e) => {
        setSelectedStudentId(e.target.value);
    };

    // ถ้ายังไม่มีข้อมูลนักเรียน แสดงข้อความแนะนำให้เพิ่มนักเรียน
    if (students.length === 0) {
        return (
            <div className="progress-page">
                <div className="progress-header">
                    <h1>ความก้าวหน้าของนักเรียน</h1>
                    <Link to="/coding-game" className="back-to-game">
                        กลับไปเล่นเกม
                    </Link>
                </div>
                <div className="no-students-message">
                    <p>ยังไม่มีข้อมูลนักเรียนในระบบ กรุณาเพิ่มนักเรียนใหม่</p>
                    <button className="add-student-btn" onClick={() => {
                        // เพิ่มนักเรียนตัวอย่าง
                        const newStudent = {
                            id: '1',
                            name: 'นักเรียนคนที่ 1',
                            totalLevels: 10,
                            completedLevels: 0,
                            lastPlayedLevel: 1,
                            achievements: []
                        };
                        setStudents([newStudent]);
                        setSelectedStudentId('1');
                        localStorage.setItem('studentsProgress', JSON.stringify([newStudent]));
                    }}>เพิ่มนักเรียนตัวอย่าง</button>
                </div>
            </div>
        );
    }

    // ถ้ายังไม่ได้เลือกนักเรียน
    if (!currentStudent) {
        return <div className="loading">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="progress-page">
            <div className="progress-header">
                <h1>ความก้าวหน้าของนักเรียน</h1>
                <Link to="/coding-game" className="back-to-game">
                    กลับไปเล่นเกม
                </Link>
            </div>

            <div className="student-selector">
                <label htmlFor="student-select">เลือกนักเรียน:</label>
                <select 
                    id="student-select" 
                    value={selectedStudentId} 
                    onChange={handleStudentChange}
                >
                    {students.map(student => (
                        <option key={student.id} value={student.id}>
                            {student.name}
                        </option>
                    ))}
                </select>
                <button 
                    className="add-student-btn"
                    onClick={() => {
                        const newId = String(students.length + 1);
                        const newStudent = {
                            id: newId,
                            name: `นักเรียนคนที่ ${newId}`,
                            totalLevels: 10,
                            completedLevels: 0,
                            lastPlayedLevel: 1,
                            achievements: []
                        };
                        
                        const updatedStudents = [...students, newStudent];
                        setStudents(updatedStudents);
                        setSelectedStudentId(newId);
                        localStorage.setItem('studentsProgress', JSON.stringify(updatedStudents));
                    }}
                >
                    เพิ่มนักเรียนใหม่
                </button>
            </div>

            <div className="progress-container">
                <div className="student-info">
                    <h2>{currentStudent.name}</h2>
                </div>
                
                <div className="progress-overview">
                    <div className="progress-circle">
                        <div className="percentage">{calculatePercentage()}%</div>
                        <div className="label">ความสำเร็จ</div>
                    </div>
                    <div className="progress-stats">
                        <div className="stat-item">
                            <span className="stat-label">ด่านที่ผ่านแล้ว:</span>
                            <span className="stat-value">{currentStudent.completedLevels} จาก {currentStudent.totalLevels}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">ด่านปัจจุบัน:</span>
                            <span className="stat-value">{currentStudent.lastPlayedLevel}</span>
                        </div>
                    </div>
                </div>

                <div className="level-progress">
                    <h2>ความก้าวหน้าแต่ละด่าน</h2>
                    <div className="level-grid">
                        {Array.from({ length: currentStudent.totalLevels }, (_, i) => (
                            <div 
                                key={i} 
                                className={`level-item ${i < currentStudent.completedLevels ? 'completed' : 
                                                        i === currentStudent.lastPlayedLevel - 1 ? 'current' : ''}`}
                            >
                                <div className="level-number">{i + 1}</div>
                                {i < currentStudent.completedLevels && <span className="check">✓</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="achievements-section">
                    <h2>ความสำเร็จ</h2>
                    <div className="achievements-grid">
                        <div className={`achievement-item ${currentStudent.completedLevels >= 1 ? 'achieved' : 'locked'}`}>
                            <div className="achievement-icon">🎯</div>
                            <div className="achievement-info">
                                <h3>เริ่มต้นการเดินทาง</h3>
                                <p>ผ่านด่านแรก</p>
                            </div>
                        </div>
                        <div className={`achievement-item ${currentStudent.completedLevels >= 5 ? 'achieved' : 'locked'}`}>
                            <div className="achievement-icon">⭐</div>
                            <div className="achievement-info">
                                <h3>นักเขียนโปรแกรมมือใหม่</h3>
                                <p>ผ่าน 5 ด่านแรก</p>
                            </div>
                        </div>
                        <div className={`achievement-item ${currentStudent.completedLevels >= currentStudent.totalLevels ? 'achieved' : 'locked'}`}>
                            <div className="achievement-icon">🏆</div>
                            <div className="achievement-info">
                                <h3>ผู้เชี่ยวชาญ</h3>
                                <p>ผ่านทุกด่าน</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ส่วนจัดการข้อมูลนักเรียน */}
                <div className="student-management">
                    <h2>จัดการข้อมูลนักเรียน</h2>
                    <div className="management-controls">
                        <button 
                            className="update-progress"
                            onClick={() => {
                                // เพิ่มความก้าวหน้าเพื่อทดสอบ
                                const updatedStudents = students.map(student => {
                                    if (student.id === selectedStudentId) {
                                        let completedLevels = student.completedLevels;
                                        if (completedLevels < student.totalLevels) {
                                            completedLevels++;
                                        }
                                        return {
                                            ...student,
                                            completedLevels,
                                            lastPlayedLevel: completedLevels + 1 > student.totalLevels 
                                                ? student.totalLevels 
                                                : completedLevels + 1
                                        };
                                    }
                                    return student;
                                });
                                
                                setStudents(updatedStudents);
                                localStorage.setItem('studentsProgress', JSON.stringify(updatedStudents));
                            }}
                        >
                            เพิ่มความก้าวหน้า
                        </button>
                        
                        <button 
                            className="reset-progress"
                            onClick={() => {
                                if (window.confirm(`ต้องการรีเซ็ตความก้าวหน้าของ ${currentStudent.name} หรือไม่?`)) {
                                    const updatedStudents = students.map(student => {
                                        if (student.id === selectedStudentId) {
                                            return {
                                                ...student,
                                                completedLevels: 0,
                                                lastPlayedLevel: 1,
                                                achievements: []
                                            };
                                        }
                                        return student;
                                    });
                                    
                                    setStudents(updatedStudents);
                                    localStorage.setItem('studentsProgress', JSON.stringify(updatedStudents));
                                }
                            }}
                        >
                            รีเซ็ตความก้าวหน้า
                        </button>
                        
                        <button 
                            className="delete-student"
                            onClick={() => {
                                if (window.confirm(`ต้องการลบข้อมูลของ ${currentStudent.name} หรือไม่?`)) {
                                    const updatedStudents = students.filter(student => student.id !== selectedStudentId);
                                    
                                    setStudents(updatedStudents);
                                    if (updatedStudents.length > 0) {
                                        setSelectedStudentId(updatedStudents[0].id);
                                    } else {
                                        setSelectedStudentId(null);
                                        setCurrentStudent(null);
                                    }
                                    
                                    localStorage.setItem('studentsProgress', JSON.stringify(updatedStudents));
                                }
                            }}
                        >
                            ลบนักเรียน
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;