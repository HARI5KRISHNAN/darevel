import express from 'express';
import {
  getIncidents,
  getIncidentById,
  resolveIncident,
  getIncidentStats,
  clearOldIncidents
} from '../services/incident.service';

const router = express.Router();

/**
 * GET /api/incidents
 * Get list of incidents with optional limit
 */
router.get('/', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const incidents = getIncidents(limit);
    res.json({
      success: true,
      count: incidents.length,
      incidents
    });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidents',
      error: error.message
    });
  }
});

/**
 * GET /api/incidents/stats
 * Get incident analytics and statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getIncidentStats();
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error fetching incident stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident stats',
      error: error.message
    });
  }
});

/**
 * GET /api/incidents/:id
 * Get specific incident by ID
 */
router.get('/:id', (req, res) => {
  try {
    const incident = getIncidentById(req.params.id);
    if (incident) {
      res.json({
        success: true,
        incident
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }
  } catch (error: any) {
    console.error('Error fetching incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident',
      error: error.message
    });
  }
});

/**
 * POST /api/incidents/:id/resolve
 * Mark an incident as resolved
 */
router.post('/:id/resolve', (req, res) => {
  try {
    const incident = resolveIncident(req.params.id);
    if (incident) {
      res.json({
        success: true,
        message: 'Incident marked as resolved',
        incident
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Incident not found or already resolved'
      });
    }
  } catch (error: any) {
    console.error('Error resolving incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve incident',
      error: error.message
    });
  }
});

/**
 * DELETE /api/incidents/old
 * Clear incidents older than specified days (default: 7)
 */
router.delete('/old', (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    if (isNaN(days) || days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid days parameter. Must be a positive number.'
      });
    }

    const cleared = clearOldIncidents(days);
    res.json({
      success: true,
      message: `Cleared ${cleared} incidents older than ${days} days`,
      cleared
    });
  } catch (error: any) {
    console.error('Error clearing old incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear old incidents',
      error: error.message
    });
  }
});

export default router;
