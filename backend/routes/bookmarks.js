const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Bookmark = require("../models/Bookmark");
const BookmarkList = require("../models/BookmarkList");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

const router = express.Router();

// Get all bookmarks for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const { listId, type } = req.query;

    const query = { user: req.userId };
    if (listId) {
      query.list = listId === "null" ? null : listId;
    }
    if (type === "questions") {
      query.question = { $exists: true };
    } else if (type === "answers") {
      query.answer = { $exists: true };
    }

    const bookmarks = await Bookmark.find(query)
      .populate(
        "question",
        "title description tags category difficulty createdAt views upvotes author"
      )
      .populate("answer", "content createdAt upvotes accepted author")
      .populate("list", "name color")
      .populate("question.author", "username avatar")
      .populate("answer.author", "username avatar")
      .sort({ createdAt: -1 });

    res.json({ bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if an item is bookmarked
router.get("/check", auth, async (req, res) => {
  try {
    const { questionId, answerId } = req.query;

    if (!questionId && !answerId) {
      return res
        .status(400)
        .json({ message: "Either questionId or answerId is required" });
    }

    const query = { user: req.userId };
    if (questionId) {
      query.question = questionId;
      query.answer = { $exists: false };
    } else if (answerId) {
      query.answer = answerId;
      query.question = { $exists: false };
    }

    const bookmark = await Bookmark.findOne(query);
    res.json({ isBookmarked: !!bookmark, bookmark: bookmark || null });
  } catch (error) {
    console.error("Error checking bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a bookmark
router.post(
  "/",
  auth,
  [
    body("questionId")
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage("Invalid question ID"),
    body("answerId")
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage("Invalid answer ID"),
    body("listId")
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage("Invalid list ID"),
    body("notes")
      .optional({ checkFalsy: true })
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Validation errors:", errors.array());
        return res.status(400).json({
          message: errors.array()[0].msg || "Validation failed",
          errors: errors.array(),
        });
      }

      const { questionId, answerId, listId, notes } = req.body;

      // Clean up undefined/null values
      const cleanQuestionId = questionId || null;
      const cleanAnswerId = answerId || null;
      const cleanListId = listId || null;

      if (!cleanQuestionId && !cleanAnswerId) {
        return res
          .status(400)
          .json({ message: "Either questionId or answerId is required" });
      }

      // Verify the question/answer exists
      if (cleanQuestionId) {
        const question = await Question.findById(cleanQuestionId);
        if (!question) {
          return res.status(404).json({ message: "Question not found" });
        }
      }
      if (cleanAnswerId) {
        const answer = await Answer.findById(cleanAnswerId);
        if (!answer) {
          return res.status(404).json({ message: "Answer not found" });
        }
      }

      // Verify list belongs to user if provided
      if (cleanListId) {
        const list = await BookmarkList.findOne({
          _id: cleanListId,
          user: req.userId,
        });
        if (!list) {
          return res.status(404).json({ message: "List not found" });
        }
      }

      // Check if already bookmarked - construct query properly
      const bookmarkQuery = { user: req.userId };
      if (cleanQuestionId) {
        bookmarkQuery.question = cleanQuestionId;
        bookmarkQuery.answer = { $exists: false };
      } else if (cleanAnswerId) {
        bookmarkQuery.answer = cleanAnswerId;
        bookmarkQuery.question = { $exists: false };
      }

      const existingBookmark = await Bookmark.findOne(bookmarkQuery);

      if (existingBookmark) {
        // Update existing bookmark
        if (cleanListId !== undefined && cleanListId !== null) {
          existingBookmark.list = cleanListId;
        }
        if (notes !== undefined) {
          existingBookmark.notes = notes || "";
        }
        await existingBookmark.save();
        await existingBookmark.populate([
          { path: "question", select: "title" },
          { path: "answer", select: "content" },
          { path: "list", select: "name color" },
        ]);
        return res.json({
          bookmark: existingBookmark,
          message: "Bookmark updated",
        });
      }

      // Create new bookmark - ensure fields are properly set
      const bookmarkData = {
        user: req.userId,
      };

      if (cleanQuestionId) {
        bookmarkData.question = cleanQuestionId;
      }
      if (cleanAnswerId) {
        bookmarkData.answer = cleanAnswerId;
      }
      if (cleanListId) {
        bookmarkData.list = cleanListId;
      }
      if (notes) {
        bookmarkData.notes = notes;
      }

      const bookmark = new Bookmark(bookmarkData);

      await bookmark.save();
      await bookmark.populate([
        { path: "question", select: "title" },
        { path: "answer", select: "content" },
        { path: "list", select: "name color" },
      ]);

      res.status(201).json({ bookmark, message: "Bookmark created" });
    } catch (error) {
      console.error("Error creating bookmark:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: error.stack,
      });

      if (error.code === 11000) {
        return res.status(400).json({ message: "Item is already bookmarked" });
      }
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors || {})
          .map((err) => err.message)
          .join(", ");
        return res
          .status(400)
          .json({ message: validationErrors || error.message });
      }
      res.status(500).json({ message: error.message || "Server error" });
    }
  }
);

// Delete a bookmark
router.delete("/:id", auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark deleted" });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a bookmark (move to list, update notes)
router.put(
  "/:id",
  auth,
  [
    body("listId").optional().isMongoId().withMessage("Invalid list ID"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes must be less than 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { listId, notes } = req.body;

      const bookmark = await Bookmark.findOne({
        _id: req.params.id,
        user: req.userId,
      });
      if (!bookmark) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      if (listId !== undefined) {
        if (listId === null) {
          bookmark.list = null;
        } else {
          const list = await BookmarkList.findOne({
            _id: listId,
            user: req.userId,
          });
          if (!list) {
            return res.status(404).json({ message: "List not found" });
          }
          bookmark.list = listId;
        }
      }
      if (notes !== undefined) {
        bookmark.notes = notes;
      }

      await bookmark.save();
      await bookmark.populate("list", "name color");

      res.json({ bookmark, message: "Bookmark updated" });
    } catch (error) {
      console.error("Error updating bookmark:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all bookmark lists for the user
router.get("/lists", auth, async (req, res) => {
  try {
    const lists = await BookmarkList.find({ user: req.userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json({ lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a bookmark list
router.post(
  "/lists",
  auth,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be between 1 and 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description must be less than 200 characters"),
    body("color").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, color } = req.body;

      const list = new BookmarkList({
        user: req.userId,
        name: name.trim(),
        description: description || "",
        color: color || "#6366f1",
      });

      await list.save();
      res.status(201).json({ list, message: "List created" });
    } catch (error) {
      console.error("Error creating list:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "A list with this name already exists" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update a bookmark list
router.put(
  "/lists/:id",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be between 1 and 50 characters"),
    body("description")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Description must be less than 200 characters"),
    body("color").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, color } = req.body;
      const list = await BookmarkList.findOne({
        _id: req.params.id,
        user: req.userId,
      });

      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      if (name !== undefined) list.name = name.trim();
      if (description !== undefined) list.description = description;
      if (color !== undefined) list.color = color;

      await list.save();
      res.json({ list, message: "List updated" });
    } catch (error) {
      console.error("Error updating list:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ message: "A list with this name already exists" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete a bookmark list
router.delete("/lists/:id", auth, async (req, res) => {
  try {
    const list = await BookmarkList.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    if (list.isDefault) {
      return res.status(400).json({ message: "Cannot delete default list" });
    }

    // Move bookmarks from this list to null (no list)
    await Bookmark.updateMany(
      { list: req.params.id },
      { $set: { list: null } }
    );

    await BookmarkList.findByIdAndDelete(req.params.id);
    res.json({ message: "List deleted" });
  } catch (error) {
    console.error("Error deleting list:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
