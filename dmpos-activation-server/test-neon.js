import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_PEwAjc0vm1od@ep-tiny-night-a1axn9lu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);

async function testConnection() {
  try {
    console.log('🔗 Testing Neon connection...');
    
    // Test 1: Basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connection successful!');
    console.log('📅 Current time:', result[0].current_time);
    
    // Test 2: Check our tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Tables found:', tables.map(t => t.table_name));
    
    // Test 3: Check serial numbers
    const serials = await sql`
      SELECT serial_number, status 
      FROM serial_numbers 
      LIMIT 3
    `;
    console.log('🔑 Serial numbers:', serials);
    
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
  }
}

testConnection();