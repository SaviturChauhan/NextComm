const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");
const auth = require("../middleware/auth");
const {
  processMentions,
  notifyUpvote,
  notifyBadgeEarned,
} = require("../utils/notifications");

const router = express.Router();

// Get all questions with filtering and pagination
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("search").optional().isString(),
    query("tags").optional().isString(),
    query("category").optional().isString(),
    query("difficulty").optional().isString(),
    query("sortBy")
      .optional()
      .isIn(["newest", "oldest", "mostVoted", "mostAnswered"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};

      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      if (req.query.tags) {
        const tags = req.query.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase());
        filter.tags = { $in: tags };
      }

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.difficulty) {
        filter.difficulty = req.query.difficulty;
      }

      // Build sort object
      let sort = {};
      switch (req.query.sortBy) {
        case "oldest":
          sort = { createdAt: 1 };
          break;
        case "mostVoted":
          sort = { "votes.upvotes": -1 };
          break;
        case "mostAnswered":
          sort = { answers: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      const questions = await Question.find(filter)
        .populate("author", "username avatar points")
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Question.countDocuments(filter);

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

// Get single question with answers
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "username avatar points badges")
      .populate({
        path: "answers",
        populate: {
          path: "author",
          select: "username avatar points",
        },
      });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment view count (don't fail if save fails)
    try {
      question.views += 1;
      await question.save();
    } catch (saveError) {
      console.error("Error saving view count:", saveError);
      // Continue even if view count save fails
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      message: error.message || "Server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Create new question
router.post(
  "/",
  auth,
  [
    body("title")
      .isLength({ min: 10, max: 200 })
      .withMessage("Title must be between 10 and 200 characters"),
    body("description")
      .isLength({ min: 20, max: 15000 })
      .withMessage("Description must be between 20 and 15000 characters"),
    body("tags")
      .isArray({ min: 1, max: 5 })
      .withMessage("Must provide 1-5 tags"),
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

      const { title, description, tags, category, difficulty } = req.body;

      const question = new Question({
        title,
        description,
        author: req.userId,
        tags: tags.map((tag) => tag.toLowerCase().trim()),
        category: category || "Other",
        difficulty: difficulty || "beginner",
      });

      await question.save();

      // Update user's questions count and award points for asking a question
      let badgesBefore = [];
      const userBefore = await User.findById(req.userId);
      if (userBefore) {
        badgesBefore = userBefore.badges.map((b) => b.name);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {
          $inc: {
            questionsAsked: 1,
            points: 5, // Award 5 points for asking a question
            reputation: 1,
          },
        },
        { new: true }
      );

      // Assign badges based on new points
      if (updatedUser) {
        updatedUser.assignBadges();
        await updatedUser.save();
      }

      // Process mentions in question description
      if (description) {
        await processMentions(
          description,
          updatedUser,
          "question",
          question._id
        );
      }

      // Check for new badges and notify
      if (updatedUser) {
        const badgesAfter = updatedUser.badges.map((b) => b.name);
        const newBadges = badgesAfter.filter((b) => !badgesBefore.includes(b));
        if (newBadges.length > 0) {
          for (const badgeName of newBadges) {
            const badge = updatedUser.badges.find((b) => b.name === badgeName);
            if (badge) {
              await notifyBadgeEarned(
                req.userId,
                badge.name,
                badge.description
              );
            }
          }
        }
      }

      // Populate author info
      await question.populate("author", "username avatar points");

      res.status(201).json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update question
router.put(
  "/:id",
  auth,
  [
    body("title").optional().isLength({ min: 10, max: 200 }),
    body("description").optional().isLength({ min: 20, max: 15000 }),
    body("tags").optional().isArray({ min: 1, max: 5 }),
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

      if (question.author.toString() !== req.userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this question" });
      }

      const { title, description, tags } = req.body;

      if (title) question.title = title;
      if (description) question.description = description;
      if (tags) question.tags = tags.map((tag) => tag.toLowerCase().trim());

      await question.save();
      await question.populate("author", "username avatar points");

      res.json(question);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete question
router.delete("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.author.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this question" });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });

    // Update user's questions count and deduct points
    await User.findByIdAndUpdate(req.userId, {
      $inc: {
        questionsAsked: -1,
        points: -5, // Deduct 5 points for deleting a question
        reputation: -1,
      },
    });

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Vote on question
router.post(
  "/:id/vote",
  auth,
  [
    body("voteType")
      .isIn(["upvote", "downvote", "remove"])
      .withMessage("Invalid vote type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { voteType } = req.body;
      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const existingVote = question.votes.voters.find(
        (vote) => vote.user.toString() === req.userId
      );

      let pointsChange = 0;

      if (voteType === "remove") {
        if (existingVote) {
          if (existingVote.voteType === "upvote") {
            question.votes.upvotes -= 1;
            pointsChange = -2; // Remove upvote points
          } else {
            question.votes.downvotes -= 1;
            pointsChange = 1; // Remove downvote penalty
          }
          question.votes.voters = question.votes.voters.filter(
            (vote) => vote.user.toString() !== req.userId
          );
        }
      } else {
        if (existingVote) {
          // Update existing vote
          if (existingVote.voteType !== voteType) {
            if (existingVote.voteType === "upvote") {
              question.votes.upvotes -= 1;
              question.votes.downvotes += 1;
              pointsChange = -3; // Remove upvote points and add downvote penalty
            } else {
              question.votes.downvotes -= 1;
              question.votes.upvotes += 1;
              pointsChange = 3; // Remove downvote penalty and add upvote points
            }
            existingVote.voteType = voteType;
          }
        } else {
          // Add new vote
          question.votes.voters.push({
            user: req.userId,
            voteType,
          });
          if (voteType === "upvote") {
            question.votes.upvotes += 1;
            pointsChange = 2; // Award 2 points for upvote on question
          } else {
            question.votes.downvotes += 1;
            pointsChange = -1; // Deduct 1 point for downvote on question
          }
        }
      }

      await question.save();

      // Get voter for notifications
      const voter = await User.findById(req.userId);

      // Update question author's points if there's a change
      if (pointsChange !== 0) {
        let badgesBefore = [];
        const questionAuthorUser = await User.findById(question.author);
        if (questionAuthorUser) {
          badgesBefore = questionAuthorUser.badges.map((b) => b.name);
        }

        const updatedAuthor = await User.findByIdAndUpdate(
          question.author,
          {
            $inc: {
              points: pointsChange,
              reputation: pointsChange,
            },
          },
          { new: true }
        );

        // Assign badges based on new points
        if (updatedAuthor) {
          updatedAuthor.assignBadges();
          await updatedAuthor.save();

          // Notify on upvote (only for new upvotes, not removals or downvotes)
          if (
            voteType === "upvote" &&
            (!existingVote || existingVote.voteType !== "upvote")
          ) {
            if (voter) {
              await notifyUpvote("question", question, voter);
            }
          }

          // Check for new badges and notify
          const badgesAfter = updatedAuthor.badges.map((b) => b.name);
          const newBadges = badgesAfter.filter(
            (b) => !badgesBefore.includes(b)
          );
          if (newBadges.length > 0) {
            for (const badgeName of newBadges) {
              const badge = updatedAuthor.badges.find(
                (b) => b.name === badgeName
              );
              if (badge) {
                await notifyBadgeEarned(
                  question.author,
                  badge.name,
                  badge.description
                );
              }
            }
          }
        }
      }

      res.json({
        upvotes: question.votes.upvotes,
        downvotes: question.votes.downvotes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
