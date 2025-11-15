import express from 'express';
import {
  getRecentIncidents,
  getIncidentById,
  clearOldIncidents,
  getMonitoringStatus
} from '../services/podMonitor.service';

const router = express.Router();

/**
 * GET /api/autoheal/incidents
 * Get recent auto-healing incidents
 */
router.get('/incidents', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const incidents = getRecentIncidents(limit);

    res.json({
      success: true,
      incidents,
      total: incidents.length
    });
  } catch (error: any) {
    console.error('Error fetching incidents:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidents',
      error: error.message
    });
  }
});

/**
 * GET /api/autoheal/incidents/:id
 * Get incident by ID
 */
router.get('/incidents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const incident = getIncidentById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    res.json({
      success: true,
      incident
    });
  } catch (error: any) {
    console.error('Error fetching incident:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident',
      error: error.message
    });
  }
});

/**
 * DELETE /api/autoheal/incidents/old
 * Clear old incidents
 */
router.delete('/incidents/old', (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const cleared = clearOldIncidents(hours);

    res.json({
      success: true,
      cleared,
      message: `Cleared ${cleared} incidents older than ${hours} hours`
    });
  } catch (error: any) {
    console.error('Error clearing old incidents:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear old incidents',
      error: error.message
    });
  }
});

/**
 * GET /api/autoheal/status
 * Get auto-healing monitoring status
 */
router.get('/status', (req, res) => {
  try {
    const status = getMonitoringStatus();

    res.json({
      success: true,
      status
    });
  } catch (error: any) {
    console.error('Error fetching status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring status',
      error: error.message
    });
  }
});

export default router;
