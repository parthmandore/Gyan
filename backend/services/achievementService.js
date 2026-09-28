
const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");
const Progress = require("../models/Progress");
const User = require("../models/User");

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
      { badge_id: achievement.badge_id },
      { $setOnInsert: achievement },
      { upsert: true }
    );
  }
};

// --------------------------------------------------
// CHECK AND SAVE USER ACHIEVEMENTS
// --------------------------------------------------

const checkAchievements = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return [];
  }

  const progressRecords = await Progress.find({
    user: userId,
  }).sort({ createdAt: 1 });

  const earnedBadgeIds = new Set();

  if (progressRecords.length >= 1) {
    earnedBadgeIds.add("first_game");
  }

  const perfectProgress = progressRecords.find(
    (progress) => Number(progress.accuracy) >= 100
  );

  if (perfectProgress) {
    earnedBadgeIds.add("perfect_round");
  }

  if (progressRecords.length >= 5) {
    earnedBadgeIds.add("quick_learner");
  }

  if (Number(user.streak || 0) >= 7) {
    earnedBadgeIds.add("reading_streak_7");
  }

  const earnedAtByBadge = new Map();

  if (progressRecords.length >= 1) {
    earnedAtByBadge.set(
      "first_game",
      progressRecords[0].createdAt || new Date()
    );
  }

  if (perfectProgress) {
    earnedAtByBadge.set(
      "perfect_round",
      perfectProgress.createdAt || new Date()
    );
  }

  if (progressRecords.length >= 5) {
    earnedAtByBadge.set(
      "quick_learner",
      progressRecords[4].createdAt || new Date()
    );
  }

  if (Number(user.streak || 0) >= 7) {
    earnedAtByBadge.set(
      "reading_streak_7",
      user.lastActiveAt || new Date()
    );
  }

  // Persist each user's earned badges independently.
  // Existing earned_at timestamps are never overwritten.
  for (const badge_id of earnedBadgeIds) {
    await UserAchievement.updateOne(
      {
        user: userId,
        badge_id,
      },
      {
        $setOnInsert: {
          user: userId,
          badge_id,
          earned_at: earnedAtByBadge.get(badge_id),
        },
      },
      {
        upsert: true,
      }
    );
  }

  return Array.from(earnedBadgeIds);
};

// --------------------------------------------------
// GET USER ACHIEVEMENTS
// --------------------------------------------------

const getUserAchievements = async (userId) => {
  await seedAchievements();

  await checkAchievements(userId);

  const achievements = await Achievement.find({
    isActive: true,
  }).lean();

  const userAchievements = await UserAchievement.find({
    user: userId,
  }).lean();

  const earnedMap = new Map(
    userAchievements.map((item) => [
      item.badge_id,
      item.earned_at,
    ])
  );

  const earned = achievements
    .filter((achievement) =>
      earnedMap.has(achievement.badge_id)
    )
    .map((achievement) => {
      const earnedAt = earnedMap.get(achievement.badge_id);

      return {
        badge_id: achievement.badge_id,
        description_key: achievement.description_key,
        earned_at: earnedAt
          ? new Date(earnedAt).toISOString()
          : null,
      };
    });

  const available = achievements
    .filter(
      (achievement) =>
        !earnedMap.has(achievement.badge_id)
    )
    .map((achievement) => ({
      badge_id: achievement.badge_id,
      description_key: achievement.description_key,
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