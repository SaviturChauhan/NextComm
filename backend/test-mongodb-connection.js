#!/usr/bin/env node
/**
 * MongoDB Connection Test Script
 * 
 * This script tests your MongoDB connection string to verify it works.
 * 
 * Usage:
 *   1. Set MONGODB_URI environment variable: export MONGODB_URI="your-connection-string"
 *   2. Or edit this file and replace MONGODB_URI below
 *   3. Run: node test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Get connection string from environment or use placeholder
const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_CONNECTION_STRING_HERE';

// Validate connection string
if (!MONGODB_URI || MONGODB_URI === 'YOUR_CONNECTION_STRING_HERE') {
  console.error('❌ ERROR: MONGODB_URI not set!');
  console.error('');
  console.error('Please set MONGODB_URI environment variable:');
  console.error('  export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"');
  console.error('');
  console.error('Or edit this file and replace MONGODB_URI above.');
  process.exit(1);
}

// Mask password in logs
const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log('🔍 Testing MongoDB connection...');
console.log('📍 Connection string:', maskedUri.split('?')[0] + '?***');
console.log('');

// Parse connection string to show details
try {
  const url = new URL(MONGODB_URI.replace('mongodb+srv://', 'https://'));
  const host = url.hostname;
  const path = url.pathname;
  const database = path.split('/')[1] || 'default';
  
  console.log('📊 Connection Details:');
  console.log('   Host:', host);
  console.log('   Database:', database || '(not specified - will use default)');
  console.log('   Protocol: mongodb+srv (SRV record)');
  console.log('');
} catch (e) {
  console.warn('⚠️  Could not parse connection string format');
  console.log('');
}

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
};

console.log('⏳ Attempting to connect...');
console.log('');

// Attempt connection
const startTime = Date.now();

mongoose.connect(MONGODB_URI, options)
  .then((connection) => {
    const duration = Date.now() - startTime;
    console.log('✅ SUCCESS! MongoDB connected successfully!');
    console.log('');
    console.log('📊 Connection Info:');
    console.log('   Database:', connection.connection.db.databaseName);
    console.log('   Host:', connection.connection.host);
    console.log('   Port:', connection.connection.port);
    console.log('   Connection state:', connection.connection.readyState);
    console.log('   Connection time:', duration + 'ms');
    console.log('');
    console.log('🎉 Your MongoDB connection is working correctly!');
    console.log('');
    console.log('Next steps:');
    console.log('   1. Use this connection string in Vercel environment variables');
    console.log('   2. Make sure MONGODB_URI is set in Vercel');
    console.log('   3. Redeploy your backend');
    console.log('');
    
    // Test a simple query
    return connection.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful - cluster is responding');
    process.exit(0);
  })
  .catch((err) => {
    const duration = Date.now() - startTime;
    console.error('❌ FAILED! MongoDB connection failed');
    console.error('');
    console.error('📊 Error Details:');
    console.error('   Error name:', err.name);
    console.error('   Error message:', err.message);
    console.error('   Error code:', err.code);
    console.error('   Connection time:', duration + 'ms');
    console.error('');
    
    // Provide helpful error messages
    console.error('🔍 Troubleshooting:');
    console.error('');
    
    if (err.message.includes('authentication failed') || err.message.includes('Authentication failed')) {
      console.error('❌ AUTHENTICATION FAILED');
      console.error('   → Check your username and password');
      console.error('   → Make sure password is URL-encoded if it has special characters');
      console.error('   → Verify the database user exists in MongoDB Atlas');
      console.error('   → Try creating a new database user with a simple password');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('❌ HOST NOT FOUND');
      console.error('   → Check your cluster hostname in the connection string');
      console.error('   → Verify your cluster is running in MongoDB Atlas');
      console.error('   → Make sure you\'re using the correct connection string from Atlas');
    } else if (err.message.includes('timeout') || err.code === 'ETIMEDOUT' || err.name === 'MongooseServerSelectionError') {
      console.error('❌ CONNECTION TIMEOUT');
      console.error('   → Check MongoDB Atlas Network Access settings');
      console.error('   → Make sure 0.0.0.0/0 is allowed (allows all IPs)');
      console.error('   → Verify your cluster is running (not paused)');
      console.error('   → Check if firewall is blocking the connection');
    } else if (err.message.includes('SSL') || err.message.includes('TLS')) {
      console.error('❌ SSL/TLS ERROR');
      console.error('   → Make sure connection string uses mongodb+srv:// (not mongodb://)');
      console.error('   → Check Network Access settings in MongoDB Atlas');
      console.error('   → Try updating mongoose: npm install mongoose@latest');
    } else if (err.message.includes('bad auth') || err.message.includes('Invalid')) {
      console.error('❌ INVALID CREDENTIALS');
      console.error('   → Check username and password');
      console.error('   → Verify database user exists and is active');
      console.error('   → Try resetting the password in MongoDB Atlas');
    } else {
      console.error('❌ UNKNOWN ERROR');
      console.error('   → Check MongoDB Atlas cluster status');
      console.error('   → Verify Network Access allows 0.0.0.0/0');
      console.error('   → Check connection string format');
      console.error('   → Review error message above for details');
    }
    
    console.error('');
    console.error('💡 Next steps:');
    console.error('   1. Go to MongoDB Atlas and check:');
    console.error('      - Is cluster running? (not paused)');
    console.error('      - Does Network Access allow 0.0.0.0/0?');
    console.error('      - Does database user exist and is active?');
    console.error('   2. Get a fresh connection string from MongoDB Atlas');
    console.error('   3. Verify connection string format is correct');
    console.error('   4. Try this test script again');
    console.error('');
    
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted - closing connection...');
  mongoose.connection.close().then(() => {
    console.log('✅ Connection closed');
    process.exit(0);
  });
});

