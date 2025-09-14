// Test script for /api/talent/search endpoint
const fetch = require('node-fetch');

async function testTalentSearch() {
  const response = await fetch('http://localhost:3001/api/talent/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gender: 'FEMALE',
      minAge: 20,
      maxAge: 35,
      bodyType: 'SLIM',
      minExperience: 1,
      maxExperience: 10,
      search: 'actress',
      page: 1,
      pageSize: 5
    })
  });
  const data = await response.json();
  console.log('Talent search result:', JSON.stringify(data, null, 2));
}

testTalentSearch();
