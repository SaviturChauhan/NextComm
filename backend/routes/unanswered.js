const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const router = express.Router();

// Get all unanswered questions (zero answers)
router.get('/unanswered', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const search = req.query.search;

    // Find questions with zero answers
    const questionsWithAnswers = await Answer.distinct('question');
    
    const query = { _id: { $nin: questionsWithAnswers } };
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    if (difficulty && difficulty !== 'All Levels') {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching unanswered questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions with no accepted answer
router.get('/no-accepted-answer', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const search = req.query.search;

    // Find all questions that have answers
    const questionsWithAnswers = await Answer.distinct('question');
    
    // Find questions with accepted answers
    const acceptedAnswers = await Answer.find({ accepted: true }).select('question');
    const questionsWithAcceptedAnswers = acceptedAnswers.map(a => a.question.toString());
    
    // Find questions that have answers but no accepted answer
    const query = {
      _id: { $in: questionsWithAnswers, $nin: questionsWithAcceptedAnswers }
    };
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    if (difficulty && difficulty !== 'All Levels') {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(query);

    // Get answer counts for each question
    const answerCounts = await Answer.aggregate([
      { $match: { question: { $in: questions.map(q => q._id) } } },
      { $group: { _id: '$question', count: { $sum: 1 } } }
    ]);

    const answerCountMap = {};
    answerCounts.forEach(item => {
      answerCountMap[item._id.toString()] = item.count;
    });

    const questionsWithCounts = questions.map(q => ({
      ...q.toObject(),
      answerCount: answerCountMap[q._id.toString()] || 0
    }));

    res.json({
      questions: questionsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions with no accepted answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get counts for unanswered and no-accepted-answer questions
router.get('/stats', async (req, res) => {
  try {
    const questionsWithAnswers = await Answer.distinct('question');
    const unansweredCount = await Question.countDocuments({
      _id: { $nin: questionsWithAnswers }
    });

    const acceptedAnswers = await Answer.find({ accepted: true }).select('question');
    const questionsWithAcceptedAnswers = acceptedAnswers.map(a => a.question.toString());
    const noAcceptedAnswerCount = await Question.countDocuments({
      _id: { $in: questionsWithAnswers, $nin: questionsWithAcceptedAnswers }
    });

    res.json({
      unanswered: unansweredCount,
      noAcceptedAnswer: noAcceptedAnswerCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;






