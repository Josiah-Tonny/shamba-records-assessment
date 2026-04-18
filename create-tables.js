import pool from './src/server/db.js';

const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Drop existing tables if they exist (in correct order due to foreign keys)
    await pool.query('DROP TABLE IF EXISTS field_updates CASCADE;');
    await pool.query('DROP TABLE IF EXISTS fields CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Fields table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(100) NOT NULL,
        crop_type    VARCHAR(100) NOT NULL,
        planting_date DATE NOT NULL,
        stage        VARCHAR(20) NOT NULL DEFAULT 'planted'
                     CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
        assigned_to  INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_by   INTEGER REFERENCES users(id),
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      );
    `);

    // Field Updates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS field_updates (
        id         SERIAL PRIMARY KEY,
        field_id   INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
        agent_id   INTEGER NOT NULL REFERENCES users(id),
        stage      VARCHAR(20) NOT NULL
                   CHECK (stage IN ('planted', 'growing', 'ready', 'harvested')),
        notes      TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    pool.end();
  }
};

createTables();