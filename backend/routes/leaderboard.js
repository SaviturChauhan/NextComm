const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get top users by points
    const users = await User.find({ isActive: true })
      .select('username avatar points badges questionsAsked answersGiven reputation')
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments({ isActive: true });

    // Add rank to each user
    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));

    res.json({
      leaderboard: usersWithRank,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top 3 users for homepage
router.get('/top', async (req, res) => {
  try {
    const topUsers = await User.find({ isActive: true })
      .select('username avatar points badges')
      .sort({ points: -1 })
      .limit(3);

    res.json(topUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rank
router.get('/rank/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count users with higher points
    const rank = await User.countDocuments({
      points: { $gt: user.points },
      isActive: true
    }) + 1;

    res.json({ rank, points: user.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard by category (questions asked, answers given, etc.)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let sortField = 'points';
    switch (category) {
      case 'questions':
        sortField = 'questionsAsked';
        break;
      case 'answers':
        sortField = 'answersGiven';
        break;
      case 'reputation':
        sortField = 'reputation';
        break;
      default:
        sortField = 'points';
    }

    const users = await User.find({ isActive: true })
      .select('username avatar points badges questionsAsked answersGiven reputation')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));

    res.json({
      leaderboard: usersWithRank,
      category,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

