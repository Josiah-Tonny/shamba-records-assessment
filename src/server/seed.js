import axios from 'axios';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const seedDatabase = async () => {
  try {
    console.log('Seeding database with demo data...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    const agentPassword = await bcrypt.hash('Agent@1234', 10);

    // Seed users
    const usersResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES
         ($1, $2, $3, $4),
         ($5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, role`,
      [
        'Admin User',
        'admin@smartseason.com',
        adminPassword,
        'admin',
        'Field Agent',
        'agent@smartseason.com',
        agentPassword,
        'agent'
      ]
    );

    // Query for users (either from INSERT result or already existing)
    const allUsersResult = await pool.query('SELECT id, role FROM users WHERE role IN ($1, $2)', ['admin', 'agent']);
    const allUsers = allUsersResult.rows;
    const adminId = allUsers.find(u => u.role === 'admin')?.id;
    const agentId = allUsers.find(u => u.role === 'agent')?.id;

    if (!adminId || !agentId) {
      console.log('Error: Admin and Agent users must exist');
      return;
    }

    console.log('✓ Admin and Agent users ready');

    // Seed fields
    const fieldsData = [
      {
        name: 'North Field A',
        crop_type: 'Maize',
        planting_date: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString().split('T')[0],
        assigned_to: agentId,
        created_by: adminId,
        stage: 'growing'
      },
      {
        name: 'South Field B',
        crop_type: 'Beans',
        planting_date: new Date(new Date().setDate(new Date().getDate() - 100)).toISOString().split('T')[0],
        assigned_to: agentId,
        created_by: adminId,
        stage: 'planted'
      },
      {
        name: 'East Field C',
        crop_type: 'Wheat',
        planting_date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0],
        assigned_to: agentId,
        created_by: adminId,
        stage: 'planted'
      },
      {
        name: 'West Field D',
        crop_type: 'Sorghum',
        planting_date: new Date(new Date().setDate(new Date().getDate() - 200)).toISOString().split('T')[0],
        assigned_to: agentId,
        created_by: adminId,
        stage: 'harvested'
      }
    ];

    for (const field of fieldsData) {
      await pool.query(
        `INSERT INTO fields (name, crop_type, planting_date, assigned_to, created_by, stage)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [field.name, field.crop_type, field.planting_date, field.assigned_to, field.created_by, field.stage]
      );
    }

    console.log('✓ Created demo fields');

    // Seed field updates
    const updates = [
      {
        field_id: 1,
        agent_id: agentId,
        stage: 'growing',
        notes: 'Plants are looking healthy, good height at this stage'
      },
      {
        field_id: 2,
        agent_id: agentId,
        stage: 'planted',
        notes: 'Initial planting complete, monitoring water levels'
      },
      {
        field_id: 4,
        agent_id: agentId,
        stage: 'harvested',
        notes: 'Harvest completed successfully, yield was good'
      }
    ];

    for (const update of updates) {
      await pool.query(
        `INSERT INTO field_updates (field_id, agent_id, stage, notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [update.field_id, update.agent_id, update.stage, update.notes]
      );
    }

    console.log('✓ Created demo field updates');
    console.log('\n✅ Database seeding complete!');
    console.log('\nDemo credentials:');
    console.log('  Admin - admin@smartseason.com / Admin@1234');
    console.log('  Agent - agent@smartseason.com / Agent@1234');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    pool.end();
  }
};

seedDatabase();