// Safe test script for AI endpoint
require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5001/api/ai/summary';
const TEST_TRANSCRIPT = `
Alice: Let's discuss the Q3 marketing strategy.
Bob: I think we should focus on social media campaigns.
Charlie: Agreed. Our last campaign increased engagement by 25%.
Alice: Let's allocate 40% of the budget to social media then.
Bob: Should we hire that new agency?
Charlie: Yes, their proposal was impressive.
Alice: Action item: Contact the agency by Friday.
`;

async function testSummaryEndpoint() {
  console.log('Testing AI summary endpoint...');
  
  try {
    const response = await axios.post(API_URL, {
      transcript: TEST_TRANSCRIPT
    });
    
    console.log('SUCCESS! Summary generated:');
    console.log('------------------------');
    console.log(response.data.summary);
    console.log('------------------------');
    return true;
  } catch (error) {
    console.error('ERROR testing endpoint:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Run the test
testSummaryEndpoint()
  .then(success => {
    console.log(success ? 'Test completed successfully!' : 'Test failed!');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });