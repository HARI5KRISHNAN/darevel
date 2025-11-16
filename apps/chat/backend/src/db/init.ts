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
    // Check if PostgreSQL user exists
    const userCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [dbConfig.user]
    );

    if (userCheckResult.rows.length === 0) {
      console.log(`👤 Creating PostgreSQL user: ${dbConfig.user}`);
      await adminPool.query(
        `CREATE USER ${dbConfig.user} WITH ENCRYPTED PASSWORD '${dbConfig.password}'`
      );
      await adminPool.query(
        `ALTER USER ${dbConfig.user} CREATEDB`
      );
      console.log(`✅ User created: ${dbConfig.user}`);
    } else {
      console.log(`✅ User already exists: ${dbConfig.user}`);
    }

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

    // Grant privileges to user on the database
    await adminPool.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${dbConfig.database} TO ${dbConfig.user}`
    );
    console.log(`✅ Granted privileges to user: ${dbConfig.user}`);

    await adminPool.end();

    // Now connect to our database and run migrations
    const pool = new Pool(dbConfig);

    console.log('📋 Running database migrations...');
    // Use path relative to project root for ts-node-dev compatibility
    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
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
