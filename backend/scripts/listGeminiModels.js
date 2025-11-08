require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  console.log('Listing available Gemini models...');
  console.log('==========================================\n');

  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY is not set');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('Available models:');
    models.forEach(model => {
      console.log(`  - ${model.name}`);
    });
    
    // Try to use the first available model
    if (models.length > 0) {
      const firstModel = models[0];
      console.log(`\n✅ Found ${models.length} model(s)`);
      console.log(`\nTesting with: ${firstModel.name}`);
      
      const model = genAI.getGenerativeModel({ model: firstModel.name });
      const result = await model.generateContent('Say hello in one word.');
      const response = await result.response;
      console.log(`Response: ${response.text()}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    
    // Try direct API call to check available models
    console.log('\nTrying to check API directly...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
      const data = await response.json();
      console.log('Available models from API:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Could not fetch models:', e.message);
    }
  }
}

listAvailableModels();







