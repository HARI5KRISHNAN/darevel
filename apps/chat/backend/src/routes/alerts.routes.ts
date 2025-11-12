import express from 'express';
import { getRecentAlerts, acknowledgeAlert, clearOldAlerts } from '../services/alert.service';
import { handlePrometheusAlert } from '../controllers/alerts.controller';

const router = express.Router();

/**
 * GET /api/alerts
 * Get recent pod alerts
 */
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const alerts = getRecentAlerts(limit);
    res.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching alerts:', error.message);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

/**
 * POST /api/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/:id/acknowledge', (req, res) => {
  try {
    const { id } = req.params;
    const success = acknowledgeAlert(id);

    if (success) {
      res.json({ success: true, message: 'Alert acknowledged' });
    } else {
      res.status(404).json({ success: false, message: 'Alert not found' });
    }
  } catch (error: any) {
    console.error('Error acknowledging alert:', error.message);
    res.status(500).json({ message: 'Failed to acknowledge alert' });
  }
});

/**
 * DELETE /api/alerts/old
 * Clear old alerts
 */
router.delete('/old', (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const cleared = clearOldAlerts(hours);
    res.json({ success: true, cleared });
  } catch (error: any) {
    console.error('Error clearing old alerts:', error.message);
    res.status(500).json({ message: 'Failed to clear old alerts' });
  }
});

/**
 * POST /api/alerts/webhook
 * Prometheus AlertManager webhook endpoint
 * Receives alerts from AlertManager and sends email notifications
 */
router.post('/webhook', handlePrometheusAlert);

export default router;
