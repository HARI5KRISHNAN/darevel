import express from 'express';
import { register, login, getAllUsers, clearAllUsers } from '../controllers/auth.controller.inmemory';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers); // For debugging
router.delete('/users', clearAllUsers); // For testing

export default router;