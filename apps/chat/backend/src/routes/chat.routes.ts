import express from 'express';
import { getMessages, sendMessage, clearAllMessages } from '../controllers/chat.controller.inmemory';

const router = express.Router();

router.get('/:channelId/messages', getMessages);
router.post('/:channelId/messages', sendMessage);
router.delete('/messages', clearAllMessages); // Clear all messages for testing

export default router;