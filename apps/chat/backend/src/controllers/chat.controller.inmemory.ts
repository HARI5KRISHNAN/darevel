/**
 * In-Memory Chat Controller
 *
 * Stores messages in memory instead of PostgreSQL database
 * Perfect for testing without database setup
 */

import type { Role, BroadcastMessage } from '../types';

// In-memory message store: channelId -> messages[]
const messageStore: Map<string, any[]> = new Map();

let messageIdCounter = 1;

/**
 * Clear all messages (for testing)
 */
export const clearAllMessages = async (req, res) => {
  messageStore.clear();
  messageIdCounter = 1;
  console.log('🗑️  All messages cleared');
  res.status(200).json({ message: 'All messages cleared' });
};

/**
 * Get messages for a channel
 */
export const getMessages = async (req, res) => {
  const { channelId } = req.params;
  const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : 1;

  try {
    // Get messages for this channel (or empty array if none)
    const messages = messageStore.get(channelId) || [];

    // Transform to expected format
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.timestamp,
      isRead: msg.isRead,
      reactions: msg.reactions || [],
      sender: msg.sender,
      role: msg.sender.id === userId ? 'user' : 'model'
    }));

    res.status(200).json(transformedMessages);
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
    // Use user data from request (sent from frontend after login/registration)
    const user = {
      id: userId,
      name: userName || `User ${userId}`,
      email: userEmail || `user${userId}@whooper.com`,
      avatar: userAvatar || `https://i.pravatar.cc/80?u=user${userId}@whooper.com`
    };

    // Create new message
    const newMessage: BroadcastMessage = {
      id: messageIdCounter++,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      reactions: [],
      channelId,
      sender: user,
      role: 'user' as Role,
    };

    // Get or create channel message array
    const channelMessages = messageStore.get(channelId) || [];
    channelMessages.push(newMessage);
    messageStore.set(channelId, channelMessages);

    // Broadcast via Socket.IO
    if (req.io) {
      req.io.to(channelId).emit('new_message', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};
