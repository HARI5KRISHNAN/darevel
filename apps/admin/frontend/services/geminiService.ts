import { GoogleGenAI } from '@google/genai';
import { User, Team, OrgStats, ActivityLog } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const generateAdminInsights = async (
  prompt: string,
  contextData: { users: User[]; teams: Team[]; stats: OrgStats; activity: ActivityLog[] }
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return 'API Key is missing. Please configure your environment.';
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const systemContext = `
    You are an AI Assistant for an Admin Console.
    You have access to the following organization data:
    - Stats: ${JSON.stringify(contextData.stats)}
    - Recent Activity: ${JSON.stringify(contextData.activity)}
    - Team Count: ${contextData.teams.length}
    - User Count: ${contextData.users.length}

    Answer the user's question concisely based on this data.
    If the user asks for analysis, provide helpful insights.
    Do not invent data that is not present.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemContext,
      },
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I encountered an error while processing your request.';
  }
};
