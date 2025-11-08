const express = require("express");
const { body, validationResult, query } = require("express-validator");
const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const admin = require("../middleware/admin");

const router = express.Router();

// ==================== DASHBOARD STATS ====================
router.get("/stats", admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();

    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // New questions this week
    const newQuestionsThisWeek = await Question.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // New answers this week
    const newAnswersThisWeek = await Answer.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    res.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      newUsersThisWeek,
      newQuestionsThisWeek,
      newAnswersThisWeek,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== USER MANAGEMENT ====================
// Get all users with pagination
router.get(
  "/users",
  admin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments();

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get single user details
router.get("/users/:id", admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's questions and answers count
    const questionsCount = await Question.countDocuments({ author: user._id });
    const answersCount = await Answer.countDocuments({ author: user._id });

    res.json({
      ...user.toObject(),
      questionsCount,
      answersCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
router.put(
  "/users/:id/role",
  admin,
  [
    body("role")
      .isIn(["USER", "ADMIN"])
      .withMessage("Role must be either USER or ADMIN"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { role } = req.body;
      const userId = req.params.id;

      // Prevent admin from changing their own role
      if (userId === req.userId.toString()) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete user and all their content
router.delete("/users/:id", admin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.userId.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all questions by this user
    const userQuestions = await Question.find({ author: userId });
    for (const question of userQuestions) {
      // Delete all answers to these questions
      await Answer.deleteMany({ question: question._id });
    }
    await Question.deleteMany({ author: userId });

    // Delete all answers by this user
    const userAnswers = await Answer.find({ author: userId });
    for (const answer of userAnswers) {
      // Remove answer from question's answers array
      await Question.updateMany(
        { answers: answer._id },
        { $pull: { answers: answer._id } }
      );
      // Remove accepted answer if this was the accepted answer
      await Question.updateMany(
        { acceptedAnswer: answer._id },
        { $set: { acceptedAnswer: null, isSolved: false } }
      );
    }
    await Answer.deleteMany({ author: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      message: "User and all associated content deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== QUESTION MANAGEMENT ====================
// Get all questions with pagination
router.get(
  "/questions",
  admin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const questions = await Question.find()
        .populate("author", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Question.countDocuments();

      res.json({
        questions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalQuestions: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete any question
router.delete("/questions/:id", admin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete all associated answers
    await Answer.deleteMany({ question: question._id });

    // Update user's questions count and deduct points (if author exists)
    if (question.author) {
      await User.findByIdAndUpdate(question.author, {
        $inc: {
          questionsAsked: -1,
          points: -5,
          reputation: -1,
        },
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: "Question deleted successfully by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update any question
router.put(
  "/questions/:id",
  admin,
  [
    body("title").optional().isLength({ min: 10, max: 200 }),
    body("description").optional().isLength({ min: 20, max: 15000 }),
    body("tags").optional().isArray({ min: 1, max: 5 }),
    body("category").optional().isString(),
    body("difficulty")
      .optional()
      .isIn(["beginner", "intermediate", "advanced"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const { title, description, tags, category, difficulty } = req.body;

      if (title) question.title = title;
      if (description) question.description = description;
      if (tags) question.tags = tags.map((tag) => tag.toLowerCase().trim());
      if (category) question.category = category;
      if (difficulty) question.difficulty = difficulty;

      await question.save();
      await question.populate("author", "username avatar points");

      res.json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ==================== ANSWER MANAGEMENT ====================
// Get all answers with pagination
router.get(
  "/answers",
  admin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const answers = await Answer.find()
        .populate("author", "username email")
        .populate("question", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Answer.countDocuments();

      res.json({
        answers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAnswers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete any answer
router.delete("/answers/:id", admin, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const question = await Question.findById(answer.question);

    // If this answer is accepted, unaccept it
    if (
      question &&
      question.acceptedAnswer &&
      question.acceptedAnswer.toString() === req.params.id
    ) {
      question.acceptedAnswer = null;
      question.isSolved = false;
      await question.save();
    }

    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
    });

    // Calculate points to deduct
    const pointsToDeduct = 10 + answer.votes.upvotes * 3;
    const reputationToDeduct = 2 + answer.votes.upvotes;

    // Update user's answers count and deduct points (if author exists)
    if (answer.author) {
      const updatedUser = await User.findByIdAndUpdate(
        answer.author,
        {
          $inc: {
            answersGiven: -1,
            points: -pointsToDeduct,
            reputation: -reputationToDeduct,
          },
        },
        { new: true }
      );

      if (updatedUser) {
        updatedUser.assignBadges();
        await updatedUser.save();
      }
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({ message: "Answer deleted successfully by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark/Unmark accepted answer (admin override)
router.post(
  "/answers/:id/accept",
  admin,
  [body("isAccepted").isBoolean().withMessage("isAccepted must be a boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { isAccepted } = req.body;
      const answer = await Answer.findById(req.params.id);

      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      const question = await Question.findById(answer.question);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      if (isAccepted) {
        // Unaccept previous answer if any (and deduct points if it was accepted)
        if (
          question.acceptedAnswer &&
          question.acceptedAnswer.toString() !== req.params.id
        ) {
          const previousAnswer = await Answer.findById(question.acceptedAnswer);
          if (previousAnswer) {
            previousAnswer.isAccepted = false;
            await previousAnswer.save();

            // Deduct points from previous answer author
            if (previousAnswer.author) {
              const prevAuthor = await User.findByIdAndUpdate(
                previousAnswer.author,
                {
                  $inc: { points: -50, reputation: -50 },
                },
                { new: true }
              );

              if (prevAuthor) {
                prevAuthor.assignBadges();
                await prevAuthor.save();
              }
            }
          }
        }

        // Accept this answer (only award points if it wasn't already accepted)
        const wasAlreadyAccepted = answer.isAccepted;
        answer.isAccepted = true;
        question.acceptedAnswer = answer._id;
        question.isSolved = true;

        // Award points to answer author if not already accepted
        if (!wasAlreadyAccepted && answer.author) {
          const updatedAuthor = await User.findByIdAndUpdate(
            answer.author,
            {
              $inc: { points: 50, reputation: 50 },
            },
            { new: true }
          );

          if (updatedAuthor) {
            updatedAuthor.assignBadges();
            await updatedAuthor.save();
          }
        }
      } else {
        // Unaccept answer
        const wasAccepted = answer.isAccepted;
        answer.isAccepted = false;
        if (
          question.acceptedAnswer &&
          question.acceptedAnswer.toString() === req.params.id
        ) {
          question.acceptedAnswer = null;
          question.isSolved = false;

          // Deduct points from answer author only if it was previously accepted
          if (wasAccepted && answer.author) {
            const updatedAuthor = await User.findByIdAndUpdate(
              answer.author,
              {
                $inc: { points: -50, reputation: -50 },
              },
              { new: true }
            );

            if (updatedAuthor) {
              updatedAuthor.assignBadges();
              await updatedAuthor.save();
            }
          }
        }
      }

      await answer.save();
      await question.save();

      res.json({
        message: `Answer ${
          isAccepted ? "accepted" : "unaccepted"
        } successfully by admin`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
