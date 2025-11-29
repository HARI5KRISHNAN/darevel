import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWritingAssistance = async (
  prompt: string,
  context: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key is missing. Please check your configuration.";

  try {
    const modelId = "gemini-2.5-flash";
    const systemInstruction = `You are an expert writing assistant embedded in a modern document editor. 
    Your goal is to help the user write, edit, summarize, or expand on text.
    Keep formatting simple (Markdown is acceptable but plain text is preferred unless asked).
    Be concise and professional.`;

    const fullPrompt = `Context from document:\n"${context}"\n\nUser Request: ${prompt}`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};