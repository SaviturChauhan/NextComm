const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
require('dotenv').config();

const calculateUserPoints = async () => {
  try {
    console.log('🔄 Starting points synchronization...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextcomm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database\n');

    // Get all users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users to process\n`);

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.username} (ID: ${user._id})`);
      
      let totalPoints = 0;
      let totalReputation = 0;
      let breakdown = {
        questionsAsked: 0,
        questionUpvotes: 0,
        questionDownvotes: 0,
        answersGiven: 0,
        answerUpvotes: 0,
        answerDownvotes: 0,
        acceptedAnswers: 0
      };

      // Calculate points from questions
      const questions = await Question.find({ author: user._id });
      breakdown.questionsAsked = questions.length;
      
      for (const question of questions) {
        // +5 points for each question
        totalPoints += 5;
        totalReputation += 1;
        
        // +2 points per upvote
        const upvotes = question.votes?.upvotes || 0;
        breakdown.questionUpvotes += upvotes;
        totalPoints += upvotes * 2;
        totalReputation += upvotes * 2;
        
        // -1 point per downvote
        const downvotes = question.votes?.downvotes || 0;
        breakdown.questionDownvotes += downvotes;
        totalPoints -= downvotes * 1;
        totalReputation -= downvotes * 1;
      }

      // Calculate points from answers
      const answers = await Answer.find({ author: user._id });
      breakdown.answersGiven = answers.length;
      
      for (const answer of answers) {
        // +10 points for each answer
        totalPoints += 10;
        totalReputation += 2;
        
        // +3 points per upvote
        const upvotes = answer.votes?.upvotes || 0;
        breakdown.answerUpvotes += upvotes;
        totalPoints += upvotes * 3;
        totalReputation += upvotes * 3;
        
        // -2 points per downvote
        const downvotes = answer.votes?.downvotes || 0;
        breakdown.answerDownvotes += downvotes;
        totalPoints -= downvotes * 2;
        totalReputation -= downvotes * 2;
        
        // +50 points for accepted answer
        if (answer.isAccepted) {
          breakdown.acceptedAnswers += 1;
          totalPoints += 50;
          totalReputation += 50;
        }
      }

      // Update user with calculated points
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          points: Math.max(0, totalPoints), // Ensure points don't go negative
          reputation: Math.max(0, totalReputation),
          questionsAsked: breakdown.questionsAsked,
          answersGiven: breakdown.answersGiven
        },
        { new: true }
      );

      // Assign badges based on points
      const badgesBefore = updatedUser.badges.map(b => b.name);
      updatedUser.assignBadges();
      await updatedUser.save();
      const badgesAfter = updatedUser.badges.map(b => b.name);
      const newBadges = badgesAfter.filter(b => !badgesBefore.includes(b));

      console.log(`  📈 Breakdown:`);
      console.log(`     Questions Asked: ${breakdown.questionsAsked} (+${breakdown.questionsAsked * 5} points)`);
      console.log(`     Question Upvotes: ${breakdown.questionUpvotes} (+${breakdown.questionUpvotes * 2} points)`);
      console.log(`     Question Downvotes: ${breakdown.questionDownvotes} (${breakdown.questionDownvotes * -1} points)`);
      console.log(`     Answers Given: ${breakdown.answersGiven} (+${breakdown.answersGiven * 10} points)`);
      console.log(`     Answer Upvotes: ${breakdown.answerUpvotes} (+${breakdown.answerUpvotes * 3} points)`);
      console.log(`     Answer Downvotes: ${breakdown.answerDownvotes} (${breakdown.answerDownvotes * -2} points)`);
      console.log(`     Accepted Answers: ${breakdown.acceptedAnswers} (+${breakdown.acceptedAnswers * 50} points)`);
      console.log(`  ✅ Total Points: ${Math.max(0, totalPoints)}`);
      console.log(`  ✅ Total Reputation: ${Math.max(0, totalReputation)}`);
      if (newBadges.length > 0) {
        console.log(`  🏆 Badges Earned: ${newBadges.join(', ')}`);
      } else {
        console.log(`  🏆 Current Badges: ${badgesAfter.length > 0 ? badgesAfter.join(', ') : 'None'}`);
      }
    }

    console.log('\n\n🎉 Points synchronization completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Processed ${users.length} users`);
    console.log(`   - Updated points and reputation for all users`);
    console.log('\n✨ All user points are now synchronized with their activity!');

  } catch (error) {
    console.error('❌ Error synchronizing points:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit();
  }
};

// Run the script
calculateUserPoints();

