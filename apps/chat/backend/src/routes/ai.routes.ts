import express from 'express';
import { generateSummary, sendSummary } from '../controllers/ai.controller';

const router = express.Router();

// POST /api/ai/generate-summary - Generate AI summary from transcript
router.post('/generate-summary', generateSummary);

// Legacy endpoint (keep for backward compatibility)
router.post('/summary', generateSummary);

// POST /api/ai/send-summary - Send summary via email
router.post('/send-summary', sendSummary);

export default router;