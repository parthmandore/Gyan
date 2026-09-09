const Achievement = require("../models/Achievement");
const Progress = require("../models/Progress");
const User = require("../models/User");

// --------------------------------------------------
// AVAILABLE ACHIEVEMENTS
// --------------------------------------------------

const DEFAULT_ACHIEVEMENTS = [
  {
    badge_id: "first_game",
    description_key: "badge.first_game",
    criteria: {
      type: "games_completed",
      value: 1,
    },
  },

  {
    badge_id: "perfect_round",
    description_key: "badge.perfect_round",
    criteria: {
      type: "accuracy",
      value: 100,
    },
  },

  {
    badge_id: "quick_learner",
    description_key: "badge.quick_learner",
    criteria: {
      type: "games_completed",
      value: 5,
    },
  },

  {
    badge_id: "reading_streak_7",
    description_key: "badge.reading_streak_7",
    criteria: {
      type: "streak",
      value: 7,
    },
  },
];

// --------------------------------------------------
// SEED DEFAULT ACHIEVEMENTS
// --------------------------------------------------

const seedAchievements = async () => {
  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await Achievement.updateOne(
      {
        badge_id: achievement.badge_id,
      },
      {
        $setOnInsert: achievement,
      },
      {
        upsert: true,
      }
    );
  }
};

// --------------------------------------------------
// CHECK ACHIEVEMENTS
// --------------------------------------------------

const checkAchievements = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return [];
  }

  const progressRecords = await Progress.find({
    user: userId,
  });

  const totalGames = progressRecords.length;

  const hasPerfectRound = progressRecords.some(
    (progress) => progress.accuracy >= 100
  );

  const earnedBadges = [];

  if (totalGames >= 1) {
    earnedBadges.push("first_game");
  }

  if (hasPerfectRound) {
    earnedBadges.push("perfect_round");
  }

  if (totalGames >= 5) {
    earnedBadges.push("quick_learner");
  }

  if (user.streak >= 7) {
    earnedBadges.push("reading_streak_7");
  }

  return earnedBadges;
};

// --------------------------------------------------
// GET ACHIEVEMENTS FOR USER
// --------------------------------------------------

const getUserAchievements = async (userId) => {
  await seedAchievements();

  const achievements =
    await Achievement.find({
      isActive: true,
    });

  const earnedBadgeIds =
    await checkAchievements(userId);

  const earned = achievements
    .filter((achievement) =>
      earnedBadgeIds.includes(
        achievement.badge_id
      )
    )
    .map((achievement) => ({
      badge_id: achievement.badge_id,
      earned_at: achievement.updatedAt
        ? achievement.updatedAt.toISOString()
        : new Date().toISOString(),
    }));

  const available = achievements
    .filter(
      (achievement) =>
        !earnedBadgeIds.includes(
          achievement.badge_id
        )
    )
    .map((achievement) => ({
      badge_id: achievement.badge_id,
      description_key:
        achievement.description_key,
    }));

  return {
    earned,
    available,
  };
};

module.exports = {
  seedAchievements,
  checkAchievements,
  getUserAchievements,
};