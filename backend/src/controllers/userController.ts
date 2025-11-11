import { Request, Response } from 'express';
import { query } from '../config/database';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user from database or create if doesn't exist
    let result = await query('SELECT * FROM users WHERE id = $1', [req.user.sub]);

    if (result.rows.length === 0) {
      // Create user record
      result = await query(
        'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) RETURNING *',
        [req.user.sub, req.user.email || '', req.user.name || '']
      );
    }

    const dbUser = result.rows[0];

    // Merge Keycloak data with database data
    const userProfile = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      roles: req.user.realm_access?.roles || [],
      keycloak: {
        sub: req.user.sub,
        preferred_username: req.user.preferred_username,
        email_verified: true,
      },
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at,
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;

    const result = await query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [name, req.user.sub]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
