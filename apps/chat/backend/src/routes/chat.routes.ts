import express from 'express';
import { getChatController } from '../config/db-switch';

const router = express.Router();

// Lazy load controllers based on database availability
let chatController: any = null;

const loadController = async () => {
  if (!chatController) {
    chatController = await getChatController();
  }
  return chatController;
};

router.get('/:channelId/messages', async (req, res) => {
  const controller = await loadController();
  return controller.getMessages(req, res);
});

router.post('/:channelId/messages', async (req, res) => {
  const controller = await loadController();
  return controller.sendMessage(req, res);
});

router.delete('/messages', async (req, res) => {
  const controller = await loadController();
  return controller.clearAllMessages(req, res);
});

export default router;