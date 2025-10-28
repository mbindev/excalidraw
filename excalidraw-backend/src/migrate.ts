import { readFileSync } from 'fs';
import { join } from 'path';
import pool from './database/connection';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');

    // Read and execute schema
    const schema = readFileSync(join(__dirname, 'database', 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Schema created successfully');

    // Create initial admin user from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  No admin credentials provided. Skipping admin user creation.');
      console.warn('   Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to create admin.');
    } else {
      // Check if admin already exists
      const existingAdmin = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [adminEmail]
      );

      if (existingAdmin.rows.length > 0) {
        console.log('ℹ️  Admin user already exists. Skipping creation.');
      } else {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await pool.query(
          'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
          [adminEmail, hashedPassword, adminName, 'admin']
        );
        console.log(`✅ Admin user created: ${adminEmail}`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
