import express from 'express';
import { listPods, startWatch } from '../controllers/pods.controller';

const router = express.Router();

// GET /api/pods/list - Get current pod list
router.get('/list', listPods);

// POST /api/pods/watch/start - Start watching pods (manual trigger)
router.post('/watch/start', startWatch);

export default router;
