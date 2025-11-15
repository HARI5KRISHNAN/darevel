import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

/**
 * POST /api/ai/generate-summary
 * Generate AI summary from transcript using Gemini
 */
export const generateSummary = async (req: Request, res: Response) => {
    const { transcript, title, participants } = req.body;

    if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY in environment variables');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash (fast and cost-effective) or gemini-2.5-pro (more capable)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const meetingContext = title ? `Meeting Title: ${title}\n` : '';
        const participantsContext = participants?.length
            ? `Participants: ${participants.join(', ')}\n\n`
            : '';

        const prompt = `
${meetingContext}${participantsContext}Provide a concise summary of the following meeting transcript.
Use bullet points for key decisions and action items:

${transcript}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary });
    } catch (error: any) {
        console.error('Error generating summary:', error.message);
        res.status(500).json({
            message: 'Failed to generate summary. Please try again later or check network/API key.',
        });
    }
};

/**
 * POST /api/ai/send-summary
 * Send meeting summary via email app integration
 */
export const sendSummary = async (req: Request, res: Response) => {
    const { subject, html, recipients, summary } = req.body;

    if (!recipients || recipients.length === 0) {
        return res.status(400).json({ message: 'Recipients are required.' });
    }

    if (!summary && !html) {
        return res.status(400).json({ message: 'Summary or HTML content is required.' });
    }

    try {
        const emailAppUrl = process.env.EMAIL_APP_URL;

        if (!emailAppUrl) {
            console.warn('EMAIL_APP_URL not configured. Email sending disabled.');
            return res.status(200).json({
                sent: false,
                message: 'Email app not configured. Summary generated but not sent.',
                summary
            });
        }

        // Forward to email app
        const emailPayload = {
            subject: subject || 'Meeting Summary',
            html: html || `<pre>${summary}</pre>`,
            recipients
        };

        await axios.post(emailAppUrl, emailPayload, {
            timeout: 10000 // 10 second timeout
        });

        res.json({
            sent: true,
            message: 'Summary sent successfully',
            recipients
        });
    } catch (error: any) {
        console.error('Error sending summary:', error?.response?.data || error.message);

        // Return partial success - summary generated but email failed
        res.status(207).json({
            sent: false,
            message: 'Summary generated but failed to send email. Check EMAIL_APP_URL configuration.',
            error: error?.response?.data || error.message
        });
    }
};