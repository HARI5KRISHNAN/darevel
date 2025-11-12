import express from 'express';
import {
  sendEmail,
  sendMeetingSummary,
  sendIncidentReport,
  sendAnalyticsReport,
  suggestSubjectLines
} from '../services/email.service';

const router = express.Router();

/**
 * POST /api/email/send
 * Send a generic email
 */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, content, html } = req.body;

    if (!to || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, content'
      });
    }

    const result = await sendEmail({ to, subject, content, html });

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-summary
 * Send a meeting summary via email
 */
router.post('/send-summary', async (req, res) => {
  try {
    const { summary, title, recipients } = req.body;

    if (!summary || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: summary, title'
      });
    }

    const result = await sendMeetingSummary(summary, title, recipients);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Summary email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send summary email',
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-incident
 * Send an incident report via email
 */
router.post('/send-incident', async (req, res) => {
  try {
    const { incidentData, recipients } = req.body;

    if (!incidentData || !incidentData.podName || !incidentData.namespace) {
      return res.status(400).json({
        success: false,
        message: 'Missing required incident data'
      });
    }

    const result = await sendIncidentReport(
      {
        ...incidentData,
        timestamp: new Date(incidentData.timestamp)
      },
      recipients
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Incident email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send incident email',
      error: error.message
    });
  }
});

/**
 * POST /api/email/send-analytics
 * Send analytics report via email
 */
router.post('/send-analytics', async (req, res) => {
  try {
    const { stats, recipients } = req.body;

    if (!stats) {
      return res.status(400).json({
        success: false,
        message: 'Missing required stats data'
      });
    }

    const result = await sendAnalyticsReport(stats, recipients);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Analytics email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send analytics email',
      error: error.message
    });
  }
});

/**
 * POST /api/email/suggest-subject
 * Generate AI-powered subject line suggestions based on email content
 */
router.post('/suggest-subject', async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: content'
      });
    }

    const result = await suggestSubjectLines(content, type);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error: any) {
    console.error('Subject suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate subject suggestions',
      error: error.message
    });
  }
});

/**
 * GET /api/email/config
 * Check email service configuration status
 */
router.get('/config', (req, res) => {
  const emailAppUrl = process.env.EMAIL_APP_URL;
  const defaultRecipient = process.env.DEFAULT_EMAIL_RECIPIENT || process.env.ALERT_EMAIL;

  res.json({
    success: true,
    configured: !!emailAppUrl,
    emailAppUrl: emailAppUrl ? emailAppUrl.replace(/:[^:]*@/, ':****@') : null, // Hide credentials
    defaultRecipient: defaultRecipient || null,
    message: emailAppUrl
      ? 'Email service is configured'
      : 'Email service not configured. Set EMAIL_APP_URL in .env'
  });
});

export default router;
