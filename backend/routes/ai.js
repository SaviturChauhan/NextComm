const express = require("express");
const { body, validationResult } = require("express-validator");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const auth = require("../middleware/auth");
const {
  findDuplicateQuestions,
  generateAnswerSuggestion,
  findDuplicateQuestionsFallback,
} = require("../utils/aiService");

const router = express.Router();

// Check for duplicate questions
router.post(
  "/check-duplicates",
  auth,
  [
    body("title")
      .isLength({ min: 10, max: 200 })
      .withMessage("Title must be between 10 and 200 characters"),
    body("description").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;

      // Get recent questions (last 100) for comparison
      const recentQuestions = await Question.find({
        title: { $ne: title }, // Exclude exact matches
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .select("title description _id author createdAt");

      if (recentQuestions.length === 0) {
        return res.json({ duplicates: [] });
      }

      let duplicates = [];

      // Try AI-powered detection first
      if (process.env.GEMINI_API_KEY) {
        try {
          duplicates = await findDuplicateQuestions(
            title,
            description || "",
            recentQuestions
          );
        } catch (error) {
          console.error(
            "AI duplicate detection failed, using fallback:",
            error
          );
          // Fallback to simple matching
          duplicates = await findDuplicateQuestionsFallback(
            title,
            recentQuestions
          );
        }
      } else {
        // Use fallback if API key not configured
        duplicates = await findDuplicateQuestionsFallback(
          title,
          recentQuestions
        );
      }

      // Populate author info
      await Question.populate(duplicates, {
        path: "author",
        select: "username avatar",
      });

      res.json({
        duplicates: duplicates.slice(0, 5), // Return top 5 duplicates
        count: duplicates.length,
      });
    } catch (error) {
      console.error("Error checking duplicates:", error);
      res
        .status(500)
        .json({ message: "Error checking for duplicate questions" });
    }
  }
);

// Generate AI answer suggestion
router.post(
  "/generate-answer",
  auth,
  [body("questionId").isMongoId().withMessage("Valid question ID required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { questionId } = req.body;

      // Get the question
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          message:
            "GEMINI_API_KEY not configured. Please add it to your .env file and restart the server.",
        });
      }

      // Get existing answers for context
      const existingAnswers = await Answer.find({ question: questionId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("content");

      // Generate AI answer
      const aiAnswer = await generateAnswerSuggestion(
        question.title,
        question.description,
        existingAnswers
      );

      res.json({
        answer: aiAnswer,
        disclaimer:
          "This is an AI-generated suggestion. Please review, verify, and edit before posting.",
      });
    } catch (error) {
      console.error("Error generating AI answer:", error);
      console.error(
        "Full error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );

      // Send more detailed error message to frontend
      const statusCode = error.message?.includes("Invalid API key")
        ? 500
        : error.message?.includes("quota")
        ? 429
        : error.message?.includes("safety")
        ? 400
        : 500;

      res.status(statusCode).json({
        message:
          error.message || "Failed to generate AI answer. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
