import express from 'express';
import * as authController from '../controllers/auth.controller.postgres';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authController.getAllUsers);
router.delete('/users', authController.clearAllUsers);

export default router;