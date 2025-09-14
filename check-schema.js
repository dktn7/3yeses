// Check the actual database schema
const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking database schema...');
    const client = await pool.connect();
    
    // Get TalentProfile table structure
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'TalentProfile' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 TalentProfile table columns:');
    schemaResult.rows.forEach(row => {
      console.log(`  ${row.column_name} (${row.data_type}) - nullable: ${row.is_nullable}`);
    });
    
    // Try to get some data with basic columns
    const dataResult = await client.query('SELECT id, "likeCount" FROM "TalentProfile" LIMIT 5');
    
    console.log('\n📋 Sample data:');
    dataResult.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Likes: ${row.likeCount || 0}`);
    });
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database query error:', error.message);
  }
}

// Load environment variables
require('dotenv').config();
checkSchema();
