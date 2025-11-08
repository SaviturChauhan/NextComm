const mongoose = require('mongoose');
require('dotenv').config();

const Bookmark = require('../models/Bookmark');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('bookmarks');
    
    // Drop all existing indexes (except _id)
    console.log('Dropping existing indexes...');
    const indexes = await collection.indexes();
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (err) {
          console.log(`Could not drop index ${index.name}:`, err.message);
        }
      }
    }

    // Create new indexes
    console.log('Creating new indexes...');
    await collection.createIndex({ user: 1, question: 1 }, { 
      unique: true, 
      sparse: true, 
      name: 'user_question_unique',
      partialFilterExpression: { question: { $exists: true } } 
    });
    console.log('Created index: user_question_unique');

    await collection.createIndex({ user: 1, answer: 1 }, { 
      unique: true, 
      sparse: true, 
      name: 'user_answer_unique',
      partialFilterExpression: { answer: { $exists: true } } 
    });
    console.log('Created index: user_answer_unique');

    // Create regular indexes for performance
    await collection.createIndex({ user: 1 });
    await collection.createIndex({ question: 1 });
    await collection.createIndex({ answer: 1 });
    
    console.log('All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();





