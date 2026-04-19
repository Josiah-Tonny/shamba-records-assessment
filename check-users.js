import pool from './src/server/db.js';

async function checkUsers() {
  try {
    const res = await pool.query('SELECT id, name, email, role, password FROM users');
    console.log('Users in DB:');
    res.rows.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [${u.role}] - Password hash starts with: ${u.password.substring(0, 10)}...`);
    });
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    await pool.end();
  }
}

checkUsers();
