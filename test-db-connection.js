// Simple database connection test without Prisma client
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test if our likes table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('TalentProfile', 'Like', 'User');
    `);
    
    console.log('📋 Available tables:', result.rows.map(row => row.table_name));
    
    // Test if we can query talent profiles
    try {
      const talentCount = await client.query('SELECT COUNT(*) FROM "TalentProfile"');
      console.log('👥 Talent profiles in database:', talentCount.rows[0].count);
    } catch (e) {
      console.log('⚠️  TalentProfile table query failed:', e.message);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

// Load environment variables
require('dotenv').config();
testConnection();
