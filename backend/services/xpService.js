
const calculateXP = ({
  accuracy,
  difficulty,
  timeTakenSeconds,
}) => {
  const safeAccuracy = Number(accuracy);
  const safeDifficulty = Number(difficulty);
  const safeTime = Number(timeTakenSeconds);

  if (
    !Number.isFinite(safeAccuracy) ||
    safeAccuracy < 0 ||
    safeAccuracy > 100
  ) {
    throw new Error("Accuracy must be between 0 and 100");
  }

  if (
    !Number.isInteger(safeDifficulty) ||
    safeDifficulty < 1 ||
    safeDifficulty > 5
  ) {
    throw new Error("Difficulty must be between 1 and 5");
  }

  if (!Number.isFinite(safeTime) || safeTime < 0) {
    throw new Error("Time taken must be a non-negative number");
  }

  let xp = 10;

  // Accuracy bonus
  if (safeAccuracy >= 90) {
    xp += 15;
  } else if (safeAccuracy >= 75) {
    xp += 10;
  } else if (safeAccuracy >= 50) {
    xp += 5;
  }

  // Difficulty bonus
  xp += (safeDifficulty - 1) * 5;

  // Speed bonus
  if (safeTime <= 60) {
    xp += 5;
  }

  return xp;
};

// Calculate level from total XP
const calculateLevel = (xpTotal) => {
  const xp = Math.max(0, Number(xpTotal) || 0);

  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 450) return 3;
  if (xp < 700) return 4;
  if (xp < 1000) return 5;

  return 6 + Math.floor((xp - 1000) / 300);
};

// Get XP information for dashboard
const getXPProgress = (xpTotal) => {
  const total = Math.max(0, Number(xpTotal) || 0);
  const level = calculateLevel(total);

  let currentLevelXP;
  let nextLevelXP;

  if (level <= 5) {
    const levelThresholds = [0, 100, 250, 450, 700, 1000];

    currentLevelXP = levelThresholds[level - 1];
    nextLevelXP = levelThresholds[level];
  } else {
    currentLevelXP = 1000 + (level - 6) * 300;
    nextLevelXP = currentLevelXP + 300;
  }

  return {
    level,
    xpTotal: total,
    xpEarnedInLevel: total - currentLevelXP,
    xpToNextLevel: Math.max(0, nextLevelXP - total),
    nextLevelXP,
  };
};

module.exports = {
  calculateXP,
  calculateLevel,
  getXPProgress,
};