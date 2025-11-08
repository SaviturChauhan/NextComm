require('dotenv').config();

console.log('Checking Gemini API Key configuration...');
console.log('==========================================');

if (process.env.GEMINI_API_KEY) {
  const keyLength = process.env.GEMINI_API_KEY.length;
  const keyPreview = process.env.GEMINI_API_KEY.substring(0, 10) + '...' + process.env.GEMINI_API_KEY.substring(keyLength - 5);
  console.log('✅ GEMINI_API_KEY is set!');
  console.log(`   Key length: ${keyLength} characters`);
  console.log(`   Key preview: ${keyPreview}`);
  console.log('\n✅ Configuration looks good!');
} else {
  console.log('❌ GEMINI_API_KEY is NOT set!');
  console.log('\nPlease add the following to your .env file:');
  console.log('GEMINI_API_KEY=your_api_key_here');
  console.log('\nThen restart your server.');
}

console.log('\n==========================================');





