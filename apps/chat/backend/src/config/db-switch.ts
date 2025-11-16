/**
 * Database Controller Switcher
 *
 * Automatically uses PostgreSQL controllers if database is available,
 * otherwise falls back to in-memory controllers
 */

import { Pool } from 'pg';

let usePostgres = false;

// Test database connection
const testConnection = async (): Promise<boolean> => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'whooper',
    password: process.env.POSTGRES_PASSWORD || 'whooper123',
    database: process.env.POSTGRES_DB || 'whooper',
  };

  const pool = new Pool(dbConfig);

  try {
    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch (error) {
    return false;
  }
};

export async function initializeDatabaseSwitch(): Promise<void> {
  const isConnected = await testConnection();

  if (isConnected) {
    usePostgres = true;
    console.log('✅ Using PostgreSQL database');
  } else {
    usePostgres = false;
    console.log('⚠️  Using in-memory storage (PostgreSQL not available)');
  }
}

export function shouldUsePostgres(): boolean {
  return usePostgres;
}

export async function getAuthController() {
  if (usePostgres) {
    return await import('../controllers/auth.controller.postgres');
  } else {
    return await import('../controllers/auth.controller.inmemory');
  }
}

export async function getChatController() {
  if (usePostgres) {
    return await import('../controllers/chat.controller.postgres');
  } else {
    return await import('../controllers/chat.controller.inmemory');
  }
}
