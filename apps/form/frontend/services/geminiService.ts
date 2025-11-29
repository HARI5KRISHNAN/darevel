import { GoogleGenAI, Type } from "@google/genai";
import { FieldType, FormField } from "../types";
import { v4 as uuidv4 } from 'uuid';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key not found in environment");
      throw new Error("API Key missing");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateFormSchema = async (topic: string): Promise<FormField[]> => {
  const ai = getClient();
  
  const prompt = `Create a comprehensive form for the following purpose: "${topic}". 
  Generate 5-10 relevant fields. 
  Ensure a mix of text inputs, multiple choice, and ratings where appropriate.
  Return ONLY the raw JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(FieldType) },
              required: { type: Type.BOOLEAN },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Only for CHOICE/DROPDOWN types"
              }
            },
            required: ['label', 'type', 'required']
          }
        }
      }
    });

    const rawFields = JSON.parse(response.text || '[]');
    
    // Transform to internal format with IDs
    return rawFields.map((field: any) => ({
      id: uuidv4(),
      type: field.type,
      label: field.label,
      required: field.required,
      options: field.options?.map((opt: string) => ({ id: uuidv4(), label: opt })) || []
    }));

  } catch (error) {
    console.error("Gemini Form Gen Error:", error);
    throw error;
  }
};

export const analyzeTextResponses = async (question: string, responses: string[]): Promise<{ summary: string, sentiment: string, themes: string[] }> => {
  if (responses.length === 0) return { summary: "No responses yet.", sentiment: "Neutral", themes: [] };

  const ai = getClient();
  const prompt = `Analyze the following responses to the question "${question}".
  Responses: ${JSON.stringify(responses.slice(0, 50))}... (truncated if too long).
  
  Provide:
  1. A concise summary (max 2 sentences).
  2. Overall sentiment (Positive, Negative, Neutral, Mixed).
  3. Key themes (max 3 bullet points).`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    sentiment: { type: Type.STRING },
                    themes: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { summary: "Could not analyze.", sentiment: "Neutral", themes: [] };
  }
};
