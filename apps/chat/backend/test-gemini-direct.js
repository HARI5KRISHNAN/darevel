// Direct test of Gemini API to find correct model name
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('No API key found in .env file');
    process.exit(1);
  }

  console.log('API Key found:', apiKey.substring(0, 10) + '...');
  console.log('\nTesting Gemini API...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  // Try different model names
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent('Say "Hello, this is a test!" in one sentence.');
      const response = result.response.text();

      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log(`Response: ${response}`);

      // If we find one that works, use it
      process.exit(0);
    } catch (error) {
      console.log(`❌ Failed with ${modelName}: ${error.message}`);
    }
  }

  console.log('\n❌ All models failed. Check your API key or try a different model name.');
  process.exit(1);
}

testGeminiAPI();
