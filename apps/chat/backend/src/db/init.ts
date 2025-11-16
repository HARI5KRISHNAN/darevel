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
  user: process.env.POSTGRES_USER || 'darevel_chat',
  password: process.env.POSTGRES_PASSWORD || 'darevel_chat123',
  database: process.env.POSTGRES_DB || 'darevel_chat',
};

/**
 * Try to connect as superuser using peer authentication
 * This works on Unix systems where PostgreSQL is configured for peer auth
 */
async function connectAsSuperuser(): Promise<Pool | null> {
  const superuserConfigs = [
    // Try peer authentication as 'postgres' user (no password, Unix socket)
    {
      host: '/var/run/postgresql', // Unix socket
      port: dbConfig.port,
      user: 'postgres',
      database: 'postgres',
    },
    // Fallback to TCP with postgres user (if password is set)
    {
      host: dbConfig.host,
      port: dbConfig.port,
      user: 'postgres',
      password: process.env.POSTGRES_SUPERUSER_PASSWORD || '',
      database: 'postgres',
    },
  ];

  for (const config of superuserConfigs) {
    try {
      const pool = new Pool(config);
      await pool.query('SELECT 1'); // Test connection
      console.log(`✅ Connected as superuser: ${config.user}`);
      return pool;
    } catch (error: any) {
      // Try next config
      continue;
    }
  }

  return null;
}

/**
 * Create user and database if they don't exist
 */
async function createUserAndDatabase(adminPool: Pool): Promise<void> {
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
    await adminPool.query(`CREATE DATABASE ${dbConfig.database} OWNER ${dbConfig.user}`);
    console.log(`✅ Database created: ${dbConfig.database}`);
  } else {
    console.log(`✅ Database already exists: ${dbConfig.database}`);
  }

  // Grant privileges to user on the database
  await adminPool.query(
    `GRANT ALL PRIVILEGES ON DATABASE ${dbConfig.database} TO ${dbConfig.user}`
  );
  console.log(`✅ Granted privileges to user: ${dbConfig.user}`);
}

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<boolean> {
  console.log('🔄 Initializing database...');

  let adminPool: Pool | null = null;
  let needsUserCreation = false;

  try {
    // First, try to connect with application credentials
    adminPool = new Pool({
      ...dbConfig,
      database: 'postgres', // Connect to default postgres database
    });

    await adminPool.query('SELECT 1'); // Test connection
    console.log(`✅ Connected as: ${dbConfig.user}`);

  } catch (error: any) {
    // If authentication fails, we need to create the user
    if (error.message.includes('password authentication failed') ||
        error.message.includes('role') && error.message.includes('does not exist')) {

      console.log(`⚠️  User ${dbConfig.user} does not exist or auth failed`);
      console.log(`🔧 Attempting to create user automatically...`);

      // Close the failed connection
      if (adminPool) {
        await adminPool.end().catch(() => {});
      }

      // Try to connect as superuser
      adminPool = await connectAsSuperuser();

      if (!adminPool) {
        console.log('');
        console.log('❌ Could not connect as PostgreSQL superuser');
        console.log('');
        console.log('To fix this, run ONE of these commands:');
        console.log('');
        console.log('Option 1 - Using sudo:');
        console.log('  sudo -u postgres psql -c "CREATE USER darevel_chat WITH ENCRYPTED PASSWORD \'darevel_chat123\'; ALTER USER darevel_chat CREATEDB;"');
        console.log('');
        console.log('Option 2 - Manual psql:');
        console.log('  psql -U postgres -c "CREATE USER darevel_chat WITH ENCRYPTED PASSWORD \'darevel_chat123\'; ALTER USER darevel_chat CREATEDB;"');
        console.log('');
        throw new Error('PostgreSQL superuser access required to create database user');
      }

      needsUserCreation = true;
    } else {
      // Different error, rethrow
      throw error;
    }
  }

  try {
    // Create user and database if needed
    if (needsUserCreation || adminPool) {
      await createUserAndDatabase(adminPool!);
    }

    await adminPool!.end();

    // Now connect to our application database and run migrations
    const pool = new Pool(dbConfig);

    console.log('📋 Running database migrations...');

    // Try multiple path resolution strategies for cross-platform compatibility
    const possiblePaths = [
      path.join(__dirname, 'schema.sql'),
      path.join(process.cwd(), 'src', 'db', 'schema.sql'),
      path.resolve(__dirname, 'schema.sql'),
    ];

    let schemaPath: string | null = null;
    for (const tryPath of possiblePaths) {
      if (fs.existsSync(tryPath)) {
        schemaPath = tryPath;
        break;
      }
    }

    if (!schemaPath) {
      throw new Error(`schema.sql not found. Tried: ${possiblePaths.join(', ')}`);
    }

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
      console.log('   Docker: docker-compose up -d postgres');
      console.log('   Or: npm run db:start');
      console.log('');
      console.log('❌ Server cannot start without PostgreSQL database');
      console.log('');
    }

    throw new Error(`Database connection required. ${error.message}`);
  }
}
