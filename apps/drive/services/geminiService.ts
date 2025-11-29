import { GoogleGenAI } from "@google/genai";
import { FileItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFileSummary = async (file: FileItem): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Please add your Gemini API key to use AI features.";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      I have a file named "${file.name}" of type "${file.type}".
      Here is a snippet or description of its content:
      "${file.content || 'No text content available, just analyze the metadata.'}"
      
      Please provide a concise 3-bullet point summary of what this file likely contains and suggest 2 workflow automations that could be useful for this file type.
      Format as Markdown.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed
      }
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI summary. Please try again later.";
  }
};

export const suggestWorkflows = async (files: FileItem[]): Promise<string> => {
    if (!apiKey) return "API Key missing.";

    try {
        const fileList = files.map(f => `- ${f.name} (${f.type})`).join('\n');
        const prompt = `
            Based on these files in a storage system:
            ${fileList}
            
            Suggest 3 automated workflows that could optimize productivity for this team.
            Example: "When a new PDF is uploaded to Marketing, automatically email the design lead."
            Keep it brief and actionable.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "No suggestions available.";
    } catch (e) {
        console.error(e);
        return "Error generating workflows.";
    }
};
