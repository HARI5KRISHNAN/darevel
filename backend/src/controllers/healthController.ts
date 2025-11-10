import { Request, Response } from 'express';
import pool from '../config/database';

export const checkHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        api: {
          status: 'up',
          message: 'API is running'
        },
        database: {
          status: 'up',
          latency: `${dbLatency}ms`,
          message: 'Database connection successful'
        },
        keycloak: {
          status: 'configured',
          issuer: process.env.KEYCLOAK_ISSUER
        }
      },
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
};
