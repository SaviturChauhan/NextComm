require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextcomm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');

    // Get user input
    const email = await question('Enter user email: ');
    if (!email) {
      console.log('❌ Email is required');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      console.log('\nAvailable users:');
      const allUsers = await User.find().select('email username role');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.username}) [${u.role}]`);
      });
      process.exit(1);
    }

    console.log(`\nFound user: ${user.username} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'ADMIN') {
      const confirm = await question('\nUser is already an admin. Make them a regular user? (y/n): ');
      if (confirm.toLowerCase() === 'y') {
        user.role = 'USER';
        await user.save();
        console.log('✓ User role changed to USER');
      } else {
        console.log('Operation cancelled');
      }
    } else {
      const confirm = await question('\nMake this user an admin? (y/n): ');
      if (confirm.toLowerCase() === 'y') {
        user.role = 'ADMIN';
        await user.save();
        console.log('✓ User role changed to ADMIN');
      } else {
        console.log('Operation cancelled');
      }
    }

    rl.close();
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();







