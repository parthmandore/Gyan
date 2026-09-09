// Calculate XP earned from a completed game

const calculateXP = ({
  accuracy,
  difficulty,
  timeTakenSeconds,
}) => {
  let xp = 10;

  // Accuracy bonus
  if (accuracy >= 90) {
    xp += 15;
  } else if (accuracy >= 75) {
    xp += 10;
  } else if (accuracy >= 50) {
    xp += 5;
  }

  // Difficulty bonus
  xp += Math.max(0, difficulty - 1) * 5;

  // Small speed bonus
  if (timeTakenSeconds <= 60) {
    xp += 5;
  }

  return xp;
};

// Calculate level from total XP
const calculateLevel = (xpTotal) => {
  if (xpTotal < 100) return 1;
  if (xpTotal < 250) return 2;
  if (xpTotal < 450) return 3;
  if (xpTotal < 700) return 4;
  if (xpTotal < 1000) return 5;

  // Every additional 300 XP = one level
  return 6 + Math.floor((xpTotal - 1000) / 300);
};

// Get XP information for dashboard
const getXPProgress = (xpTotal) => {
  const level = calculateLevel(xpTotal);

  const levelThresholds = [
    0,
    100,
    250,
    450,
    700,
    1000,
  ];

  let currentLevelXP;
  let nextLevelXP;

  if (level <= 5) {
    currentLevelXP = levelThresholds[level - 1];
    nextLevelXP = levelThresholds[level];
  } else {
    currentLevelXP = 1000 + (level - 6) * 300;
    nextLevelXP = currentLevelXP + 300;
  }

  return {
    level,
    xpTotal,
    xpEarnedInLevel: xpTotal - currentLevelXP,
    xpToNextLevel: Math.max(
      0,
      nextLevelXP - xpTotal
    ),
    nextLevelXP,
  };
};

module.exports = {
  calculateXP,
  calculateLevel,
  getXPProgress,
};