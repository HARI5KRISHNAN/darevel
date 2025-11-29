import { generateObject } from "ai"
import { createOllama } from "ollama-ai-provider-v2"
import { z } from "zod"

const slideContentSchema = z.object({
  title: z.string().describe("Slide title - concise and engaging"),
  content: z.string().describe("Main content with bullet points or key information"),
  layout: z.enum(["title", "content", "choice", "poll"]).describe("Suggested slide layout"),
  suggestions: z.array(z.string()).describe("3-5 visual element suggestions"),
  imageKeywords: z.array(z.string()).describe("Keywords for image search"),
})

export async function POST(req: Request) {
  try {
    const { topic, context, provider = "ollama" } = await req.json()

    if (!topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 })
    }

    const prompt = `Create a compelling presentation slide about: "${topic}"
${context ? `Additional context: ${context}` : ""}

Generate:
1. A clear, engaging title (max 10 words)
2. Content with 3-5 key points or bullet points
3. Suggest the best layout type (title, content, choice, or poll)
4. 3-5 visual element suggestions (icons, charts, images)
5. Keywords for finding relevant images

Make it professional, concise, and visually appealing.`

    let result

    if (provider === "ollama") {
      // Use local Ollama instance (default: llama3.2 or llama2)
      const ollama = createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      })

      result = await generateObject({
        model: ollama("llama3.2"), // or llama2, mistral, etc.
        schema: slideContentSchema,
        prompt,
        temperature: 0.7,
      })
    } else {
      // Fallback to OpenAI if specified
      result = await generateObject({
        model: "openai/gpt-4-turbo",
        schema: slideContentSchema,
        prompt,
        temperature: 0.7,
      })
    }

    return Response.json({
      success: true,
      data: {
        title: result.object.title,
        content: result.object.content,
        layout: result.object.layout,
        suggestions: result.object.suggestions,
        imageKeywords: result.object.imageKeywords,
      },
    })
  } catch (error: any) {
    console.error("Error in generate-slide:", error)

    // Provide more helpful error messages
    if (error.message?.includes("ECONNREFUSED")) {
      return Response.json({
        error: "Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434"
      }, { status: 503 })
    }

    return Response.json({
      error: error.message || "Failed to generate slide content"
    }, { status: 500 })
  }
}
