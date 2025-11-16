/**
 * PostgreSQL Chat Controller
 *
 * Production-ready chat with PostgreSQL database
 */

import type { Role, BroadcastMessage } from '../types';
import { db } from '../db';

/**
 * Get messages for a channel
 */
export const getMessages = async (req, res) => {
  const { channelId } = req.params;
  const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : null;

  try {
    // Get messages with user information
    const result = await db.query(
      `SELECT m.id, m.content, m.timestamp, m.is_read, m.channel_id,
              u.id as sender_id, u.name as sender_name, u.email as sender_email, u.avatar as sender_avatar
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.channel_id = $1
       ORDER BY m.timestamp ASC`,
      [channelId]
    );

    // Transform to expected format
    const messages = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      timestamp: row.timestamp,
      isRead: row.is_read,
      reactions: [],
      channelId: row.channel_id,
      sender: {
        id: row.sender_id,
        name: row.sender_name,
        email: row.sender_email,
        avatar: row.sender_avatar
      },
      role: (userId && row.sender_id === userId) ? 'user' : 'model'
    }));

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error while fetching messages.' });
  }
};

/**
 * Send a message to a channel
 */
export const sendMessage = async (req, res) => {
  const { channelId } = req.params;
  const { content, userId, userName, userEmail, userAvatar } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Message content cannot be empty.' });
  }
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Insert message into database
    const result = await db.query(
      'INSERT INTO messages (channel_id, user_id, content, timestamp, is_read) VALUES ($1, $2, $3, NOW(), false) RETURNING id, content, timestamp, is_read, channel_id',
      [channelId, userId, content]
    );

    const newMessage = result.rows[0];

    // Get user information
    const userResult = await db.query(
      'SELECT id, name, email, avatar FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0] || {
      id: userId,
      name: userName || `User ${userId}`,
      email: userEmail || `user${userId}@whooper.com`,
      avatar: userAvatar || `https://i.pravatar.cc/80?u=user${userId}`
    };

    // Format response
    const broadcastMessage: BroadcastMessage = {
      id: newMessage.id,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      isRead: newMessage.is_read,
      reactions: [],
      channelId: newMessage.channel_id,
      sender: user,
      role: 'user' as Role,
    };

    // Broadcast via Socket.IO
    if (req.io) {
      req.io.to(channelId).emit('new_message', broadcastMessage);
      console.log(`📤 Message broadcast to channel: ${channelId}`);
    }

    res.status(201).json(broadcastMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};

/**
 * Clear all messages (for testing only - remove in production)
 */
export const clearAllMessages = async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE messages');
    console.log('🗑️  All messages cleared');
    res.status(200).json({ message: 'All messages cleared' });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ message: 'Server error while clearing messages.' });
  }
};
