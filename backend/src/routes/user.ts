import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;
