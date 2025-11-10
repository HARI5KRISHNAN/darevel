import { Request, Response } from 'express';
import { query } from '../config/database';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Save file metadata to database
    const result = await query(
      `INSERT INTO files (user_id, filename, original_name, mimetype, size, path)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.sub,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.path,
      ]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: result.rows[0].id,
        filename: result.rows[0].original_name,
        size: result.rows[0].size,
        mimetype: result.rows[0].mimetype,
        uploaded_at: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const getUserFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await query(
      'SELECT id, filename, original_name, mimetype, size, created_at FROM files WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.sub]
    );

    res.json({
      files: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};
