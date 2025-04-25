/**
 * คำนวณจำนวนดาวที่ได้รับตามเวลาที่ใช้ไป
 * @param {number} timeUsed - เวลาที่ใช้ไปในการเล่นด่าน
 * @param {number} totalTime - เวลาทั้งหมดที่กำหนดสำหรับด่าน
 * @param {number} maxStars - จำนวนดาวสูงสุดที่เป็นไปได้ (ค่าเริ่มต้น: 5)
 * @returns {number} จำนวนดาวที่ได้รับ (0-maxStars)
 */
export const calculateStarsByTime = (timeUsed, totalTime, maxStars = 5) => {
  if (timeUsed <= 0) return maxStars; // ถ้าไม่ใช้เวลาเลย (เป็นไปไม่ได้) ได้ดาวเต็ม
  if (timeUsed >= totalTime) return 1; // อย่างน้อยได้ 1 ดาวถ้าสามารถทำด่านสำเร็จ

  // คำนวณเปอร์เซ็นต์ของเวลาที่เหลือ
  const timeLeftPercent = (totalTime - timeUsed) / totalTime;
  
  // ใช้เกณฑ์ดังนี้ (สามารถปรับเปลี่ยนได้ตามความเหมาะสม):
  // - ใช้เวลาน้อยกว่า 30% ของเวลาทั้งหมด: ได้ดาวเต็ม
  // - ใช้เวลา 30-60% ของเวลาทั้งหมด: ได้ 4 ดาว (หาก maxStars = 5)
  // - ใช้เวลา 60-80% ของเวลาทั้งหมด: ได้ 3 ดาว (หาก maxStars = 5)
  // - ใช้เวลา 80-90% ของเวลาทั้งหมด: ได้ 2 ดาว
  // - ใช้เวลามากกว่า 90% ของเวลาทั้งหมด: ได้ 1 ดาว
  
  if (timeLeftPercent >= 0.7) return maxStars;
  if (timeLeftPercent >= 0.4) return Math.max(2, maxStars - 1);
  if (timeLeftPercent >= 0.2) return Math.max(2, maxStars - 2);
  if (timeLeftPercent >= 0.1) return 2;
  return 1;
};

/**
 * บันทึกจำนวนดาวที่ได้รับในแต่ละด่านลง localStorage แยกตามรหัสนักเรียน
 * @param {string} studentId - รหัสนักเรียน
 * @param {string} gameType - ประเภทของเกม (เช่น 'bridgeGame', 'matchingGame')
 * @param {number} level - ระดับด่าน
 * @param {number} stars - จำนวนดาวที่ได้รับ
 */
export const saveLevelStars = (studentId, gameType, level, stars) => {
  try {
    if (!studentId) {
      console.error('Student ID is required to save progress');
      return;
    }

    // ใช้ studentId เป็นส่วนหนึ่งของ key
    const storageKey = `gameStars_${studentId}`;
    
    // อ่านข้อมูลที่มีอยู่
    const savedStarsStr = localStorage.getItem(storageKey);
    const savedStars = savedStarsStr ? JSON.parse(savedStarsStr) : {};
    
    // สร้างโครงสร้างข้อมูลหากยังไม่มี
    if (!savedStars[gameType]) {
      savedStars[gameType] = {};
    }
    
    // บันทึกข้อมูลดาวเฉพาะเมื่อมากกว่าค่าเดิม หรือยังไม่เคยมีข้อมูล
    if (!savedStars[gameType][level] || savedStars[gameType][level] < stars) {
      savedStars[gameType][level] = stars;
      localStorage.setItem(storageKey, JSON.stringify(savedStars));
    }
  } catch (error) {
    console.error('Failed to save level stars:', error);
  }
};

/**
 * ดึงข้อมูลจำนวนดาวที่ได้รับในด่านนั้น ๆ สำหรับนักเรียนเฉพาะคน
 * @param {string} studentId - รหัสนักเรียน
 * @param {string} gameType - ประเภทของเกม (เช่น 'bridgeGame', 'matchingGame')
 * @param {number} level - ระดับด่าน
 * @returns {number} จำนวนดาวที่เคยได้รับ (0 ถ้ายังไม่เคยเล่น)
 */
export const getLevelStars = (studentId, gameType, level) => {
  try {
    if (!studentId) {
      console.warn('Student ID is required to get progress');
      return 0;
    }

    // ใช้ studentId เป็นส่วนหนึ่งของ key
    const storageKey = `gameStars_${studentId}`;
    
    const savedStarsStr = localStorage.getItem(storageKey);
    const savedStars = savedStarsStr ? JSON.parse(savedStarsStr) : {};
    
    if (savedStars[gameType] && savedStars[gameType][level] !== undefined) {
      return savedStars[gameType][level];
    }
    return 0;
  } catch (error) {
    console.error('Failed to get level stars:', error);
    return 0;
  }
};

/**
 * ดึงข้อมูลความก้าวหน้าทั้งหมดของนักเรียน
 * @param {string} studentId - รหัสนักเรียน
 * @returns {Object} ข้อมูลความก้าวหน้าทั้งหมด หรือ {} หากไม่มีข้อมูล
 */
export const getStudentProgress = (studentId) => {
  try {
    if (!studentId) {
      console.warn('Student ID is required to get progress');
      return {};
    }

    const storageKey = `gameStars_${studentId}`;
    const savedStarsStr = localStorage.getItem(storageKey);
    return savedStarsStr ? JSON.parse(savedStarsStr) : {};
  } catch (error) {
    console.error('Failed to get student progress:', error);
    return {};
  }
};

/**
 * ลบข้อมูลความก้าวหน้าของนักเรียน
 * @param {string} studentId - รหัสนักเรียน
 * @returns {boolean} true ถ้าลบสำเร็จ
 */
export const clearStudentProgress = (studentId) => {
  try {
    if (!studentId) {
      console.error('Student ID is required to clear progress');
      return false;
    }

    const storageKey = `gameStars_${studentId}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error('Failed to clear student progress:', error);
    return false;
  }
}; 