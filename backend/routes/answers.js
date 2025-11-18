const express = require('express');
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { notifyNewAnswer, processMentions, notifyUpvote, notifyBadgeEarned, notifyAnswerAccepted } = require('../utils/notifications');

const router = express.Router();

// Create new answer
router.post('/', auth, [
  body('content')
    .notEmpty().withMessage('Answer is required (or upload an image)')
    .custom((value) => {
      // Check if image is present
      const hasImage = value && value.includes('<img');
      
      // If image is present, content is optional
      if (hasImage) {
        return true;
      }
      
      // Remove HTML tags and check minimum text content length
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      if (textContent.length < 10) {
        throw new Error('Answer must contain at least 10 characters of text (excluding HTML tags) or upload an image');
      }
      // No maximum length restriction - removed as per user request
      return true;
    }),
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
    let badgesBefore = [];
    if (updatedUser) {
      badgesBefore = updatedUser.badges.map(b => b.name);
      updatedUser.assignBadges();
      await updatedUser.save();
    }

    // Populate author info
    await answer.populate('author', 'username avatar points');
    await question.populate('author', 'username');

    // Notify question author about new answer
    if (question.author && question.author._id.toString() !== req.userId.toString()) {
      await notifyNewAnswer(question, answer, updatedUser);
    }

    // Process mentions in answer content
    if (content) {
      await processMentions(content, updatedUser, 'answer', questionId);
    }

    // Check for new badges and notify
    if (updatedUser) {
      const badgesAfter = updatedUser.badges.map(b => b.name);
      const newBadges = badgesAfter.filter(b => !badgesBefore.includes(b));
      if (newBadges.length > 0) {
        const { notifyBadgeEarned } = require('../utils/notifications');
        for (const badgeName of newBadges) {
          const badge = updatedUser.badges.find(b => b.name === badgeName);
          if (badge) {
            await notifyBadgeEarned(req.userId, badge.name, badge.description);
          }
        }
      }
    }

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

    // Compare author IDs as strings to ensure proper comparison
    const answerAuthorId = String(answer.author);
    const userId = String(req.userId);

    if (answerAuthorId !== userId) {
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

    // Initialize votes structure if it doesn't exist (for old answers)
    if (!answer.votes) {
      answer.votes = {
        upvotes: 0,
        downvotes: 0,
        voters: []
      };
    }
    if (!answer.votes.voters) {
      answer.votes.voters = [];
    }
    if (answer.votes.upvotes === undefined) {
      answer.votes.upvotes = 0;
    }
    if (answer.votes.downvotes === undefined) {
      answer.votes.downvotes = 0;
    }

    // Find existing vote for this user (only one vote per user allowed)
    const existingVoteIndex = answer.votes.voters.findIndex(
      vote => vote.user.toString() === req.userId.toString()
    );
    const existingVote = existingVoteIndex !== -1 ? answer.votes.voters[existingVoteIndex] : null;

    let pointsChange = 0;

    if (voteType === 'remove') {
      // Remove existing vote if it exists
      if (existingVote) {
        if (existingVote.voteType === 'upvote') {
          answer.votes.upvotes -= 1;
          pointsChange = -3; // Remove upvote points (3 points for answer upvote)
        } else if (existingVote.voteType === 'downvote') {
          answer.votes.downvotes -= 1;
          pointsChange = 2; // Remove downvote penalty
        }
        // Remove the vote from voters array
        answer.votes.voters.splice(existingVoteIndex, 1);
      }
    } else {
      if (existingVote) {
        // User already has a vote - handle toggle or switch
        if (existingVote.voteType === voteType) {
          // Same vote type clicked again - remove it (toggle off)
          if (voteType === 'upvote') {
            answer.votes.upvotes -= 1;
            pointsChange = -3; // Remove upvote points (3 points for answer upvote)
          } else {
            answer.votes.downvotes -= 1;
            pointsChange = 2; // Remove downvote penalty
          }
          // Remove the vote completely
          answer.votes.voters.splice(existingVoteIndex, 1);
        } else {
          // Different vote type - switch from one to the other
          // First remove the old vote
          if (existingVote.voteType === 'upvote') {
            answer.votes.upvotes -= 1;
            pointsChange = -3; // Remove upvote points
          } else {
            answer.votes.downvotes -= 1;
            pointsChange = 2; // Remove downvote penalty
          }
          
          // Then add the new vote
          if (voteType === 'upvote') {
            answer.votes.upvotes += 1;
            pointsChange += 3; // Add upvote points
          } else {
            answer.votes.downvotes += 1;
            pointsChange -= 2; // Add downvote penalty
          }
          
          // Update the existing vote type
          existingVote.voteType = voteType;
        }
      } else {
        // No existing vote - add new vote
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

    // Get voter and question for notifications
    const voter = await User.findById(req.userId);
    const question = await Question.findById(answer.question);

    // Update answer author's points if there's a change
    if (pointsChange !== 0) {
      let badgesBefore = [];
      const answerAuthorUser = await User.findById(answer.author);
      if (answerAuthorUser) {
        badgesBefore = answerAuthorUser.badges.map(b => b.name);
      }

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

        // Notify on upvote (only for new upvotes, not removals, downvotes, or toggles)
        // Check if this is a new upvote (not a toggle or switch)
        const isNewUpvote = voteType === 'upvote' && 
          (!existingVote || (existingVote.voteType !== 'upvote' && existingVote.voteType === 'downvote'));
        
        if (isNewUpvote) {
          if (voter && question) {
            await notifyUpvote('answer', answer, voter, question._id);
          }
        }

        // Check for new badges and notify
        const badgesAfter = updatedAuthor.badges.map(b => b.name);
        const newBadges = badgesAfter.filter(b => !badgesBefore.includes(b));
        if (newBadges.length > 0) {
          for (const badgeName of newBadges) {
            const badge = updatedAuthor.badges.find(b => b.name === badgeName);
            if (badge) {
              await notifyBadgeEarned(answer.author, badge.name, badge.description);
            }
          }
        }
      }
    }

    // Reload answer to ensure we have the latest data
    const updatedAnswer = await Answer.findById(req.params.id);
    
    // Return updated vote counts and voters array
    res.json({ 
      upvotes: updatedAnswer.votes.upvotes || 0, 
      downvotes: updatedAnswer.votes.downvotes || 0,
      voters: updatedAnswer.votes.voters || []
    });
  } catch (error) {
    console.error('❌ Error voting on answer:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to vote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // Get question author and answer author for notifications
    await question.populate('author', 'username');
    await answer.populate('author', 'username');
    const questionAuthor = await User.findById(question.author);
    const answerAuthor = await User.findById(answer.author);

    // Award points to answer author
    let badgesBefore = [];
    if (answerAuthor) {
      badgesBefore = answerAuthor.badges.map(b => b.name);
    }

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

      // Notify answer author about acceptance
      if (questionAuthor && question) {
        await notifyAnswerAccepted(answer, questionAuthor, question.title);
      }

      // Check for new badges and notify
      const badgesAfter = updatedAuthor.badges.map(b => b.name);
      const newBadges = badgesAfter.filter(b => !badgesBefore.includes(b));
      if (newBadges.length > 0) {
        const { notifyBadgeEarned } = require('../utils/notifications');
        for (const badgeName of newBadges) {
          const badge = updatedAuthor.badges.find(b => b.name === badgeName);
          if (badge) {
            await notifyBadgeEarned(answer.author, badge.name, badge.description);
          }
        }
      }
    }

    res.json({ message: 'Answer accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

