import { GoogleGenAI } from '@google/genai';
import { FileMetadata } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

export const generateFileAnalysis = async (file: FileMetadata, prompt?: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return 'Gemini API key missing. Set VITE_GEMINI_API_KEY to enable AI analysis.';
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const context = `
      You are an intelligent file assistant.
      User is viewing a file named "${file.name}" of type ${file.type}.
      The extracted text content of the file is:
      """
      ${file.textContent || 'No text content available.'}
      """
    `;

    const userPrompt = prompt || 'Please provide a concise summary of this file.';

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: `${context}\n\n${userPrompt}` }] }],
      config: {
        systemInstruction: 'You are a helpful and professional document analysis assistant. Keep answers concise and relevant to the document content.',
      },
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error('Gemini API Error:', error);
    return 'Sorry, I encountered an error while analyzing the document.';
  }
};
