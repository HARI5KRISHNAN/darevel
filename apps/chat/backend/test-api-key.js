// Test if the API key is valid by making a raw HTTP request
require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('No API key found');
  process.exit(1);
}

console.log('Testing API key:', apiKey.substring(0, 15) + '...');

// Test with v1 API (not v1beta)
const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

console.log('\nFetching available models from API...\n');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const parsed = JSON.parse(data);
      console.log('✅ API key is valid!');
      console.log('\nAvailable models:');
      if (parsed.models) {
        parsed.models.forEach(model => {
          if (model.name && model.supportedGenerationMethods?.includes('generateContent')) {
            console.log(`  - ${model.name} (${model.displayName})`);
          }
        });
      }
    } else {
      console.log(`❌ API Error: ${res.statusCode}`);
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});
