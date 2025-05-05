// ระบบจัดการความก้าวหน้าของเกมแยกตามประเภทและรายบุคคล

// บันทึกความก้าวหน้าของเกม
export const saveGameProgress = (gameType, progressData, studentId) => {
  if (!studentId) {
    console.warn('No student ID provided for saving game progress');
    return progressData;
  }
  
  const storageKey = `${studentId}_gameProgress`;
  const allProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
  
  // Normalize progressData
  const normalized = normalizeProgress(gameType, progressData);

  allProgress[gameType] = {
    ...allProgress[gameType],
    ...normalized,
    lastUpdated: Date.now()
  };
  
  localStorage.setItem(storageKey, JSON.stringify(allProgress));
  return allProgress[gameType];
};

// ดึงความก้าวหน้าของเกม
export const getGameProgress = (gameType, studentId) => {
  if (!studentId) {
    console.warn('No student ID provided for getting game progress');
    return getDefaultProgress(gameType);
  }
  
  const storageKey = `${studentId}_gameProgress`;
  const allProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
  return normalizeProgress(gameType, allProgress[gameType] || getDefaultProgress(gameType));
};

// ดึงความก้าวหน้าทั้งหมด
export const getAllProgress = (studentId) => {
  if (!studentId) {
    console.warn('No student ID provided for getting all progress');
    return {};
  }
  
  const storageKey = `${studentId}_gameProgress`;
  const allProgress = JSON.parse(localStorage.getItem(storageKey) || '{}');
  // Normalize ทุกเกม
  Object.keys(allProgress).forEach(key => {
    allProgress[key] = normalizeProgress(key, allProgress[key]);
  });
  return allProgress;
};

// Normalize ให้มี completedLevels, totalLevels เสมอ
const normalizeProgress = (gameType, progress) => {
  if (!progress) return getDefaultProgress(gameType);
  const def = getDefaultProgress(gameType);
  return {
    completedLevels: progress.completedLevels ?? (typeof progress === 'number' ? progress : 0),
    totalLevels: progress.totalLevels ?? def.totalLevels,
    highestScore: progress.highestScore ?? 0,
    stars: progress.stars ?? 0,
    ...progress
  };
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
        totalLevels: 4,
        highestScore: 0
      };
    case 'bridgeGame':
      return {
        completedLevels: 0,
        totalLevels: 4,
        highestScore: 0
      };
    case 'mathPuzzle':
      return {
        completedLevels: 0,
        totalLevels: 4,
        highestScore: 0,
        stars: 0
      };
    default:
      return {
        completedLevels: 0,
        totalLevels: 4,
        highestScore: 0
      };
  }
};