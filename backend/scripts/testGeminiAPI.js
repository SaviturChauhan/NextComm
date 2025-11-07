require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API connection...');
  console.log('==========================================\n');

  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY is not set in environment variables');
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`✅ API Key found (length: ${apiKey.length} characters)`);
  console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}\n`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try different model names (newest first)
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = 'Say "Hello, this is a test" in one sentence.';
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works!`);
        console.log(`   Response: ${text.substring(0, 50)}...\n`);
        return; // Success, exit
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}\n`);
      }
    }
    
    console.log('❌ All models failed. Check your API key and quota.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Full error:', error);
  }
}

testGeminiAPI();

