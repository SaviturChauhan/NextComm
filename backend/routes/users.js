const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's questions and answers
    const questions = await Question.find({ author: req.params.id })
      .select('title createdAt votes answers')
      .sort({ createdAt: -1 })
      .limit(10);

    const answers = await Answer.find({ author: req.params.id })
      .populate('question', 'title')
      .select('content createdAt votes isAccepted')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      recentQuestions: questions,
      recentAnswers: answers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's questions
router.get('/:id/questions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ author: req.params.id })
      .populate('author', 'username avatar points')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments({ author: req.params.id });

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

// Get user's answers
router.get('/:id/answers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ author: req.params.id })
      .populate('question', 'title')
      .populate('author', 'username avatar points')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Answer.countDocuments({ author: req.params.id });

    res.json({
      answers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAnswers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (authenticated users only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userId.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { bio, avatar } = req.body;
    const user = await User.findById(req.params.id);

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      points: user.points,
      badges: user.badges
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Award badge to user
router.post('/:id/badges', auth, async (req, res) => {
  try {
    // Only allow admins or the user themselves to award badges
    if (req.userId.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to award badges' });
    }

    const { badgeName, description } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has this badge
    const existingBadge = user.badges.find(badge => badge.name === badgeName);
    if (existingBadge) {
      return res.status(400).json({ message: 'User already has this badge' });
    }

    user.badges.push({
      name: badgeName,
      description: description || '',
      earnedAt: new Date()
    });

    await user.save();

    res.json({ message: 'Badge awarded successfully', badges: user.badges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

