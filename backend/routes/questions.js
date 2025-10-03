const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all questions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isString(),
  query('tags').optional().isString(),
  query('category').optional().isString(),
  query('difficulty').optional().isString(),
  query('sortBy').optional().isIn(['newest', 'oldest', 'mostVoted', 'mostAnswered'])
], async (req, res) => {
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
      const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
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
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'mostVoted':
        sort = { 'votes.upvotes': -1 };
        break;
      case 'mostAnswered':
        sort = { answers: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const questions = await Question.find(filter)
      .populate('author', 'username avatar points')
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
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single question with answers
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar points badges')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar points'
        }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new question
router.post('/', auth, [
  body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('description').isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('tags').isArray({ min: 1, max: 5 }).withMessage('Must provide 1-5 tags'),
  body('category').optional().isString(),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
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
      tags: tags.map(tag => tag.toLowerCase().trim()),
      category: category || 'Other',
      difficulty: difficulty || 'beginner'
    });

    await question.save();

    // Update user's questions count
    await User.findByIdAndUpdate(req.userId, { $inc: { questionsAsked: 1 } });

    // Populate author info
    await question.populate('author', 'username avatar points');

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/:id', auth, [
  body('title').optional().isLength({ min: 10, max: 200 }),
  body('description').optional().isLength({ min: 20, max: 5000 }),
  body('tags').optional().isArray({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this question' });
    }

    const { title, description, tags } = req.body;
    
    if (title) question.title = title;
    if (description) question.description = description;
    if (tags) question.tags = tags.map(tag => tag.toLowerCase().trim());

    await question.save();
    await question.populate('author', 'username avatar points');

    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });

    // Update user's questions count
    await User.findByIdAndUpdate(req.userId, { $inc: { questionsAsked: -1 } });

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on question
router.post('/:id/vote', auth, [
  body('voteType').isIn(['upvote', 'downvote', 'remove']).withMessage('Invalid vote type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { voteType } = req.body;
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const existingVote = question.votes.voters.find(
      vote => vote.user.toString() === req.userId
    );

    if (voteType === 'remove') {
      if (existingVote) {
        if (existingVote.voteType === 'upvote') {
          question.votes.upvotes -= 1;
        } else {
          question.votes.downvotes -= 1;
        }
        question.votes.voters = question.votes.voters.filter(
          vote => vote.user.toString() !== req.userId
        );
      }
    } else {
      if (existingVote) {
        // Update existing vote
        if (existingVote.voteType !== voteType) {
          if (existingVote.voteType === 'upvote') {
            question.votes.upvotes -= 1;
            question.votes.downvotes += 1;
          } else {
            question.votes.downvotes -= 1;
            question.votes.upvotes += 1;
          }
          existingVote.voteType = voteType;
        }
      } else {
        // Add new vote
        question.votes.voters.push({
          user: req.userId,
          voteType
        });
        if (voteType === 'upvote') {
          question.votes.upvotes += 1;
        } else {
          question.votes.downvotes += 1;
        }
      }
    }

    await question.save();
    res.json({ upvotes: question.votes.upvotes, downvotes: question.votes.downvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

