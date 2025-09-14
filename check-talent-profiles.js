// Check what talent profiles exist in the database
const { Pool } = require('pg');

async function checkTalentProfiles() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking talent profiles in database...');
    const client = await pool.connect();
    
    // Get all talent profile IDs
    const result = await client.query('SELECT id, "firstName", "lastName", "likeCount" FROM "TalentProfile" LIMIT 10');
    
    console.log('📋 Talent profiles in database:');
    result.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Name: ${row.firstName} ${row.lastName}, Likes: ${row.likeCount || 0}`);
    });
    
    // Check likes table
    const likesResult = await client.query('SELECT COUNT(*) FROM "Like"');
    console.log(`\n👍 Total likes in database: ${likesResult.rows[0].count}`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database query error:', error.message);
  }
}

// Load environment variables
require('dotenv').config();
checkTalentProfiles();
