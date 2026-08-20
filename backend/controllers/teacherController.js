const User = require("../models/User");
const Progress = require("../models/Progress");

// --------------------------------------------------
// GET TEACHER'S STUDENTS
// --------------------------------------------------

const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      teacherId: req.user._id,
      role: "student",
    })
      .select(
        "name age language xpTotal level streak lastActiveAt"
      )
      .sort({ name: 1 });

    const studentData = await Promise.all(
      students.map(async (student) => {
        const progress =
          await Progress.find({
            user: student._id,
          });

        const totalAttempts =
          progress.reduce(
            (sum, item) =>
              sum +
              Number(
                item.items_attempted || 0
              ),
            0
          );

        const totalCorrect =
          progress.reduce(
            (sum, item) =>
              sum +
              Number(
                item.items_correct || 0
              ),
            0
          );

        const accuracy =
          totalAttempts > 0
            ? Math.round(
                (totalCorrect /
                  totalAttempts) *
                  100
              )
            : 0;

        return {
          id: student._id,
          name: student.name,
          age: student.age,
          language: student.language,
          xpTotal: student.xpTotal,
          level: student.level,
          streak: student.streak,
          accuracy,
          gamesCompleted:
            progress.length,
          lastActiveAt:
            student.lastActiveAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        students: studentData,
      },
    });
  } catch (error) {
    console.error(
      "Get teacher students error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching students",
    });
  }
};

// --------------------------------------------------
// GET TEACHER DASHBOARD
// --------------------------------------------------

const getTeacherDashboard = async (
  req,
  res
) => {
  try {
    const students =
      await User.find({
        teacherId: req.user._id,
        role: "student",
      }).select(
        "name age language xpTotal level streak lastActiveAt"
      );

    const studentIds =
      students.map(
        (student) => student._id
      );

    const progress =
      await Progress.find({
        user: {
          $in: studentIds,
        },
      })
        .sort({ createdAt: -1 })
        .limit(500);

    // ----------------------------------------------
    // Class statistics
    // ----------------------------------------------

    const totalStudents =
      students.length;

    const todayStart = new Date();

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const todayProgress =
      progress.filter(
        (item) =>
          new Date(item.createdAt) >=
          todayStart
      );

    const activeStudentIds =
      new Set(
        todayProgress.map(
          (item) =>
            String(item.user)
        )
      );

    const activeToday =
      activeStudentIds.size;

    const completedToday =
      todayProgress.length;

    // ----------------------------------------------
    // Average class accuracy
    // ----------------------------------------------

    const totalAttempts =
      progress.reduce(
        (sum, item) =>
          sum +
          Number(
            item.items_attempted || 0
          ),
        0
      );

    const totalCorrect =
      progress.reduce(
        (sum, item) =>
          sum +
          Number(
            item.items_correct || 0
          ),
        0
      );

    const classAccuracy =
      totalAttempts > 0
        ? Math.round(
            (totalCorrect /
              totalAttempts) *
              100
          )
        : 0;

    // ----------------------------------------------
    // Students on track
    // ----------------------------------------------

    const studentsWithProgress =
      students.filter((student) =>
        progress.some(
          (item) =>
            String(item.user) ===
            String(student._id)
        )
      );

    const studentsOnTrack =
      studentsWithProgress.length;

    const classProgressPercentage =
      totalStudents > 0
        ? Math.round(
            (studentsOnTrack /
              totalStudents) *
              100
          )
        : 0;

    // ----------------------------------------------
    // Activity counts
    // ----------------------------------------------

    const activityTypes = [
      {
        game_type:
          "alphabet_matching",

        title:
          "Letter Practice",

        description:
          "Alphabet recognition",
      },

      {
        game_type:
          "capital_small_match",

        title:
          "Capital & Small",

        description:
          "Letter matching",
      },

      {
        game_type:
          "vowel_matra_match",

        title:
          "Vowel & Matra",

        description:
          "Vowel recognition",
      },
    ];

    const activities =
      activityTypes.map(
        (activity) => {
          const uniqueStudents =
            new Set(
              progress
                .filter(
                  (item) =>
                    item.game_type ===
                    activity.game_type
                )
                .map(
                  (item) =>
                    String(item.user)
                )
            );

          return {
            title:
              activity.title,

            description:
              activity.description,

            students:
              uniqueStudents.size,
          };
        }
      );

    // ----------------------------------------------
    // Student performance
    // ----------------------------------------------

    const studentPerformance =
      await Promise.all(
        students.map(
          async (student) => {
            const studentProgress =
              progress.filter(
                (item) =>
                  String(item.user) ===
                  String(student._id)
              );

            const attempts =
              studentProgress.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.items_attempted ||
                      0
                  ),
                0
              );

            const correct =
              studentProgress.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.items_correct ||
                      0
                  ),
                0
              );

            const accuracy =
              attempts > 0
                ? Math.round(
                    (correct /
                      attempts) *
                      100
                  )
                : 0;

            return {
              id: student._id,
              name: student.name,
              initial:
                student.name
                  ?.charAt(0)
                  .toUpperCase(),

              percentage:
                accuracy,

              level:
                student.level,

              xp:
                student.xpTotal,

              streak:
                student.streak,

              lastActiveAt:
                student.lastActiveAt,
            };
          }
        )
      );

    // ----------------------------------------------
    // Students needing attention
    // ----------------------------------------------

    const studentsNeedingAttention =
      students.filter(
        (student) => {
          if (!student.lastActiveAt) {
            return true;
          }

          const lastActive =
            new Date(
              student.lastActiveAt
            );

          const twoDaysAgo =
            new Date();

          twoDaysAgo.setDate(
            twoDaysAgo.getDate() - 2
          );

          return (
            lastActive <
            twoDaysAgo
          );
        }
      );

    // ----------------------------------------------
    // Recent activity
    // ----------------------------------------------

    const recentActivity =
      progress.slice(0, 10).map(
        (item) => {
          const student =
            students.find(
              (student) =>
                String(student._id) ===
                String(item.user)
            );

          return {
            title: `${
              student?.name ||
              "Student"
            } completed ${formatGameTitle(
              item.game_type
            )}`,

            time:
              item.createdAt,

            xp:
              `+${item.xp_earned || 0} XP`,
          };
        }
      );

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        classroom: {
          name: "Gyan Learning Class",
          level:
            "Early learners",
          language:
            getClassLanguage(
              students
            ),
          students:
            totalStudents,
          activeToday,
          completedToday,
        },

        classProgress: {
          percentage:
            classProgressPercentage,

          studentsOnTrack,

          totalStudents,
        },

        classAccuracy,

        activities,

        students:
          studentPerformance,

        attention: {
          count:
            studentsNeedingAttention.length,

          message:
            "Students haven't practised recently",

          description:
            "Consider encouraging them to complete a learning activity.",
        },

        recentActivity,

        teachingTip:
          "Encourage students to practise for a few minutes every day.",
      },
    });
  } catch (error) {
    console.error(
      "Teacher dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while loading teacher dashboard",
    });
  }
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getClassLanguage = (
  students
) => {
  if (students.length === 0) {
    return "English";
  }

  const languageCounts = {};

  students.forEach(
    (student) => {
      languageCounts[
        student.language
      ] =
        (languageCounts[
          student.language
        ] || 0) + 1;
    }
  );

  const mostCommon =
    Object.entries(
      languageCounts
    ).sort(
      (a, b) =>
        b[1] - a[1]
    )[0][0];

  const names = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
  };

  return (
    names[mostCommon] ||
    "English"
  );
};

const formatGameTitle = (
  gameType
) => {
  const titles = {
    alphabet_matching:
      "Alphabet Matching",

    capital_small_match:
      "Capital & Small Match",

    vowel_matra_match:
      "Vowel & Matra Match",

    speech_practice:
      "Speech Practice",
  };

  return (
    titles[gameType] ||
    gameType
  );
};
// --------------------------------------------------
// LINK STUDENT TO TEACHER
// --------------------------------------------------

const linkStudent = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Student email is required",
      });
    }

    const student = await User.findOne({
      email: email.toLowerCase(),
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.teacherId = req.user._id;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student linked successfully",
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
        },
      },
    });
  } catch (error) {
    console.error(
      "Link student error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while linking student",
    });
  }
};

module.exports = {
  getStudents,
  getTeacherDashboard,
  linkStudent,
};