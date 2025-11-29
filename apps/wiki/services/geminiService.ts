import { GoogleGenAI } from "@google/genai";
import { Block } from '../types';

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
};

export const generateContent = async (
  prompt: string,
  contextBlocks: Block[]
): Promise<string> => {
  const client = getClient();
  if (!client) throw new Error("API Key not found");

  // Construct a context-aware prompt
  const contextText = contextBlocks
    .map(b => b.content)
    .join('\n');

  const fullPrompt = `
    You are an AI writing assistant for a Wiki/Knowledge Base.
    
    Context of the current document:
    ${contextText.slice(0, 2000)}... (truncated)

    User Instruction: ${prompt}

    Return ONLY the new content. Do not include introductory text like "Here is the content".
    Format the output as simple text. If the user asks for a list, use bullets.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const improveBlock = async (text: string, instruction: string): Promise<string> => {
  const client = getClient();
  if (!client) throw new Error("API Key not found");

  const prompt = `
    Original Text: "${text}"
    Instruction: ${instruction}
    
    Return only the improved version of the text.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Fallback
  }
};
