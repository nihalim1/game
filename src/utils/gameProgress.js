// ระบบจัดการความก้าวหน้าของเกมแยกตามประเภท

// บันทึกความก้าวหน้าของเกม
export const saveGameProgress = (gameType, progressData) => {
  // ดึงข้อมูลความก้าวหน้าทั้งหมดที่มีอยู่
  const allProgress = JSON.parse(localStorage.getItem('allGameProgress') || '{}');
  
  // บันทึกความก้าวหน้าใหม่
  allProgress[gameType] = {
    ...allProgress[gameType],  // คงค่าข้อมูลเดิมที่มีอยู่
    ...progressData,           // อัปเดตข้อมูลใหม่
    lastUpdated: Date.now()    // เพิ่มเวลาอัปเดตล่าสุด
  };
  
  // บันทึกลง localStorage
  localStorage.setItem('allGameProgress', JSON.stringify(allProgress));
  
  return allProgress[gameType];
};

// ดึงความก้าวหน้าของเกม
export const getGameProgress = (gameType) => {
  const allProgress = JSON.parse(localStorage.getItem('allGameProgress') || '{}');
  return allProgress[gameType] || getDefaultProgress(gameType);
};

// ดึงความก้าวหน้าทั้งหมด
export const getAllProgress = () => {
  return JSON.parse(localStorage.getItem('allGameProgress') || '{}');
};

// กำหนดค่าเริ่มต้นสำหรับแต่ละเกม
const getDefaultProgress = (gameType) => {
  switch(gameType) {
    case 'matchingGame':
      return {
        completedLevels: 0,
        totalLevels: 10,
        highestScore: 0,
        stars: 0
      };
    case 'codingGame':
      return {
        completedLevels: 0,
        totalLevels: 8,
        highestScore: 0
      };
    case 'bridgeGame':
      return {
        completedLevels: 0,
        totalLevels: 10,
        highestScore: 0
      };
    case 'mathPuzzle':
      return {
        completedLevels: 0,
        totalLevels: 10,
        highestScore: 0,
        stars: 0
      };
    default:
      return {
        completedLevels: 0,
        totalLevels: 10,
        highestScore: 0
      };
  }
}; 