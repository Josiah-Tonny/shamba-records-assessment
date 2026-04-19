import pool from './src/server/db.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Users in database:', usersCount.rows[0].count);
    
    const admin = await pool.query('SELECT email, role FROM users WHERE email = $1', ['admin@smartseason.com']);
    console.log('Admin user found:', admin.rows[0] ? 'Yes' : 'No');
    if (admin.rows[0]) {
      console.log('Admin role:', admin.rows[0].role);
    }

  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
