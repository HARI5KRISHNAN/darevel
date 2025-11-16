import express from 'express';
import { getAuthController } from '../config/db-switch';

const router = express.Router();

// Lazy load controllers based on database availability
let authController: any = null;

const loadController = async () => {
  if (!authController) {
    authController = await getAuthController();
  }
  return authController;
};

router.post('/register', async (req, res) => {
  const controller = await loadController();
  return controller.register(req, res);
});

router.post('/login', async (req, res) => {
  const controller = await loadController();
  return controller.login(req, res);
});

router.get('/users', async (req, res) => {
  const controller = await loadController();
  return controller.getAllUsers(req, res);
});

router.delete('/users', async (req, res) => {
  const controller = await loadController();
  return controller.clearAllUsers(req, res);
});

export default router;