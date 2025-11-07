const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new answer
router.post('/', auth, [
  body('content').isLength({ min: 10, max: 10000 }).withMessage('Answer must be between 10 and 10000 characters'),
  body('questionId').isMongoId().withMessage('Valid question ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, questionId } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      author: req.userId,
      question: questionId
    });

    await answer.save();

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Update user's answers count and award points for answering
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { 
        $inc: { 
          answersGiven: 1,
          points: 10,  // Award 10 points for answering a question
          reputation: 2
        } 
      },
      { new: true }
    );
    
    // Assign badges based on new points
    if (updatedUser) {
      updatedUser.assignBadges();
      await updatedUser.save();
    }

    // Populate author info
    await answer.populate('author', 'username avatar points');

    res.status(201).json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update answer
router.put('/:id', auth, [
  body('content').isLength({ min: 10, max: 10000 }).withMessage('Answer must be between 10 and 10000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this answer' });
    }

    answer.content = req.body.content;
    answer.isEdited = true;
    answer.editedAt = new Date();

    await answer.save();
    await answer.populate('author', 'username avatar points');

    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Compare author IDs as strings to ensure proper comparison
    const answerAuthorId = String(answer.author);
    const userId = String(req.userId);

    if (answerAuthorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this answer. Only the answer author can delete their answer.' });
    }

    // Get the question to check if this answer is accepted
    const question = await Question.findById(answer.question);
    
    // If this answer is accepted, unaccept it and mark question as unsolved
    if (question && question.acceptedAnswer && question.acceptedAnswer.toString() === req.params.id) {
      question.acceptedAnswer = null;
      question.isSolved = false;
      await question.save();
    }

    // Remove answer from question's answers array
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });

    // Calculate points to deduct (base points + upvotes)
    const pointsToDeduct = 10 + (answer.votes.upvotes * 3); // Base 10 + 3 per upvote
    const reputationToDeduct = 2 + answer.votes.upvotes;

    // Update user's answers count and deduct points
    const updatedUser = await User.findByIdAndUpdate(req.userId, { 
      $inc: { 
        answersGiven: -1,
        points: -pointsToDeduct,
        reputation: -reputationToDeduct
      } 
    }, { new: true });

    // Update badges if needed
    if (updatedUser) {
      updatedUser.assignBadges();
      await updatedUser.save();
    }

    await Answer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Vote on answer
router.post('/:id/vote', auth, [
  body('voteType').isIn(['upvote', 'downvote', 'remove']).withMessage('Invalid vote type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { voteType } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const existingVote = answer.votes.voters.find(
      vote => vote.user.toString() === req.userId
    );

    let pointsChange = 0;

    if (voteType === 'remove') {
      if (existingVote) {
        if (existingVote.voteType === 'upvote') {
          answer.votes.upvotes -= 1;
          pointsChange = -3; // Remove upvote points (3 points for answer upvote)
        } else {
          answer.votes.downvotes -= 1;
          pointsChange = 2; // Remove downvote penalty
        }
        answer.votes.voters = answer.votes.voters.filter(
          vote => vote.user.toString() !== req.userId
        );
      }
    } else {
      if (existingVote) {
        // Update existing vote
        if (existingVote.voteType !== voteType) {
          if (existingVote.voteType === 'upvote') {
            answer.votes.upvotes -= 1;
            answer.votes.downvotes += 1;
            pointsChange = -5; // Remove upvote points and add downvote penalty
          } else {
            answer.votes.downvotes -= 1;
            answer.votes.upvotes += 1;
            pointsChange = 5; // Remove downvote penalty and add upvote points
          }
          existingVote.voteType = voteType;
        }
      } else {
        // Add new vote
        answer.votes.voters.push({
          user: req.userId,
          voteType
        });
        if (voteType === 'upvote') {
          answer.votes.upvotes += 1;
          pointsChange = 3; // Award 3 points for upvote on answer (more valuable than question)
        } else {
          answer.votes.downvotes += 1;
          pointsChange = -2; // Deduct 2 points for downvote on answer
        }
      }
    }

    await answer.save();

    // Update answer author's points if there's a change
    if (pointsChange !== 0) {
      const updatedAuthor = await User.findByIdAndUpdate(
        answer.author,
        {
          $inc: { 
            points: pointsChange,
            reputation: pointsChange
          }
        },
        { new: true }
      );
      
      // Assign badges based on new points
      if (updatedAuthor) {
        updatedAuthor.assignBadges();
        await updatedAuthor.save();
      }
    }

    res.json({ upvotes: answer.votes.upvotes, downvotes: answer.votes.downvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Compare author IDs as strings to ensure proper comparison
    const questionAuthorId = String(question.author);
    const userId = String(req.userId);
    
    if (questionAuthorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this answer. Only the question author can accept answers.' });
    }

    // Unaccept previous answer if any
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
    }

    // Accept this answer
    answer.isAccepted = true;
    question.acceptedAnswer = answer._id;
    question.isSolved = true;

    await answer.save();
    await question.save();

    // Award points to answer author
    const updatedAuthor = await User.findByIdAndUpdate(
      answer.author,
      { 
        $inc: { points: 50, reputation: 50 } 
      },
      { new: true }
    );
    
    // Assign badges based on new points
    if (updatedAuthor) {
      updatedAuthor.assignBadges();
      await updatedAuthor.save();
    }

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

