import express from 'express';
import * as chatController from '../controllers/chat.controller.postgres';

const router = express.Router();

router.get('/:channelId/messages', chatController.getMessages);
router.post('/:channelId/messages', chatController.sendMessage);
router.delete('/messages', chatController.clearAllMessages);

export default router;