import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { pool } from '../services/dbService.js';
import { generateRecordingUrl } from '../services/recordingService.js';

const router = express.Router();

/**
 * POST /api/mail/calendar/meetings
 * Create a new meeting
 */
router.post('/calendar/meetings', authenticateToken, async (req, res) => {
  try {
    const { title, description, scheduled_at, duration, room_name } = req.body;

    // Get user email from Keycloak token
    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    if (!title || !scheduled_at || !room_name) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: title, scheduled_at, room_name'
      });
    }

    const result = await pool.query(
      `INSERT INTO meetings (title, description, scheduled_at, duration, room_name, organizer_email, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
       RETURNING *`,
      [title, description, scheduled_at, duration || 60, room_name, userEmail]
    );

    console.log(`✅ Meeting created: ${title} by ${userEmail}`);
    res.json({ ok: true, meeting: result.rows[0] });
  } catch (error) {
    console.error('❌ Error creating meeting:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/mail/calendar/meetings
 * Get all meetings for the authenticated user
 */
router.get('/calendar/meetings', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    const result = await pool.query(
      `SELECT * FROM meetings
       WHERE organizer_email = $1
       ORDER BY scheduled_at DESC`,
      [userEmail]
    );

    res.json({ ok: true, meetings: result.rows });
  } catch (error) {
    console.error('❌ Error fetching meetings:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * GET /api/mail/calendar/meetings/:id
 * Get a specific meeting by ID
 */
router.get('/calendar/meetings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    const result = await pool.query(
      `SELECT * FROM meetings WHERE id = $1 AND organizer_email = $2`,
      [id, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Meeting not found' });
    }

    res.json({ ok: true, meeting: result.rows[0] });
  } catch (error) {
    console.error('❌ Error fetching meeting:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * PATCH /api/mail/calendar/meetings/:id
 * Update a meeting
 */
router.patch('/calendar/meetings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduled_at, duration, status, recording_url } = req.body;

    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (scheduled_at !== undefined) {
      updates.push(`scheduled_at = $${paramCount++}`);
      values.push(scheduled_at);
    }
    if (duration !== undefined) {
      updates.push(`duration = $${paramCount++}`);
      values.push(duration);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (recording_url !== undefined) {
      updates.push(`recording_url = $${paramCount++}`);
      values.push(recording_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update' });
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add WHERE clause parameters
    values.push(id);
    values.push(userEmail);

    const query = `
      UPDATE meetings
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} AND organizer_email = $${paramCount++}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Meeting not found' });
    }

    console.log(`✅ Meeting updated: ${result.rows[0].title}`);
    res.json({ ok: true, meeting: result.rows[0] });
  } catch (error) {
    console.error('❌ Error updating meeting:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * DELETE /api/mail/calendar/meetings/:id
 * Delete a meeting
 */
router.delete('/calendar/meetings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    const result = await pool.query(
      `DELETE FROM meetings WHERE id = $1 AND organizer_email = $2 RETURNING *`,
      [id, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Meeting not found' });
    }

    console.log(`✅ Meeting deleted: ${result.rows[0].title}`);
    res.json({ ok: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting meeting:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/mail/calendar/meetings/:id/join
 * Mark a meeting as in_progress when user joins
 */
router.post('/calendar/meetings/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    const result = await pool.query(
      `UPDATE meetings
       SET status = 'in_progress', updated_at = NOW()
       WHERE id = $1 AND organizer_email = $2
       RETURNING *`,
      [id, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Meeting not found' });
    }

    console.log(`✅ User ${userEmail} joined meeting: ${result.rows[0].title}`);
    res.json({ ok: true, meeting: result.rows[0] });
  } catch (error) {
    console.error('❌ Error joining meeting:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/mail/calendar/meetings/:id/end
 * End a meeting and generate recording URL
 */
router.post('/calendar/meetings/:id/end', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    // Get meeting details
    const meeting = await pool.query(
      'SELECT * FROM meetings WHERE id = $1 AND organizer_email = $2',
      [id, userEmail]
    );

    if (meeting.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Meeting not found' });
    }

    // Generate simulated recording URL
    const recordingUrl = generateRecordingUrl(meeting.rows[0].room_name);

    // Update meeting status to completed and add recording URL
    const result = await pool.query(
      `UPDATE meetings
       SET status = 'completed', recording_url = $1, updated_at = NOW()
       WHERE id = $2 AND organizer_email = $3
       RETURNING *`,
      [recordingUrl, id, userEmail]
    );

    console.log(`✅ Meeting ${id} ended. Recording URL: ${recordingUrl}`);
    res.json({ ok: true, meeting: result.rows[0], recordingUrl });
  } catch (error) {
    console.error('❌ Error ending meeting:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * PATCH /api/mail/calendar/meetings/:id/recording
 * Update recording URL for a meeting
 */
router.patch('/calendar/meetings/:id/recording', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { recording_url } = req.body;

    const userEmail = req.kauth?.grant?.access_token?.content?.email ||
                     req.kauth?.grant?.access_token?.content?.preferred_username;

    if (!userEmail) {
      return res.status(400).json({ ok: false, error: 'User email not found in token' });
    }

    if (!recording_url) {
      return res.status(400).json({ ok: false, error: 'recording_url is required' });
    }

    const result = await pool.query(
      `UPDATE meetings
       SET recording_url = $1, updated_at = NOW()
       WHERE id = $2 AND organizer_email = $3
       RETURNING *`,
      [recording_url, id, userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Meeting not found' });
    }

    console.log(`🎬 Recording URL updated for meeting ${id}: ${recording_url}`);
    res.json({ ok: true, meeting: result.rows[0] });
  } catch (error) {
    console.error('❌ Error updating recording:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
