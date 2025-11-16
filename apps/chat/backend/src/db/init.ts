/**
 * Database Initialization Script
 *
 * Automatically sets up PostgreSQL database and tables
 * Runs on server startup
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'whooper',
  password: process.env.POSTGRES_PASSWORD || 'whooper123',
  database: process.env.POSTGRES_DB || 'whooper',
};

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<boolean> {
  console.log('🔄 Initializing database...');

  // First, connect to postgres database to create our database if needed
  const adminPool = new Pool({
    ...dbConfig,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    // Check if our database exists
    const dbCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`📦 Creating database: ${dbConfig.database}`);
      await adminPool.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`✅ Database created: ${dbConfig.database}`);
    } else {
      console.log(`✅ Database already exists: ${dbConfig.database}`);
    }

    await adminPool.end();

    // Now connect to our database and run migrations
    const pool = new Pool(dbConfig);

    console.log('📋 Running database migrations...');
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schemaSql);
    console.log('✅ Database migrations completed');

    await pool.end();
    console.log('✅ Database initialization complete');

    return true;
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);

    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('⚠️  PostgreSQL is not running. To start it:');
      console.log('   Docker: docker run -d --name whooper-postgres -e POSTGRES_USER=whooper -e POSTGRES_PASSWORD=whooper123 -e POSTGRES_DB=whooper -p 5432:5432 postgres:15');
      console.log('   Or: Update DB credentials in .env file');
      console.log('');
      console.log('🔄 Server will use in-memory storage instead');
    }

    return false;
  }
}
