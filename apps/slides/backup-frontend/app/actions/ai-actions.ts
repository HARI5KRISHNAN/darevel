"use server"

import { generateText, generateObject } from "ai"
import { createOllama } from "ollama-ai-provider-v2"
import { z } from "zod"

const slideContentSchema = z.object({
  title: z.string().describe("Slide title"),
  content: z.string().describe("Main content or bullet points"),
  layout: z.enum(["title", "content", "choice", "poll"]).optional(),
  suggestions: z.array(z.string()).describe("3-5 suggestions for visual elements"),
})

/**
 * Generate slide content using AI (Ollama by default, OpenAI as fallback)
 */
export async function generateSlideContent(
  topic: string,
  context = "",
  provider: "ollama" | "openai" = "ollama"
) {
  try {
    const prompt = `Create compelling presentation slide content for the following topic: "${topic}"
${context ? `Additional context: ${context}` : ""}

Generate a title and detailed content that is engaging and informative. Format the content with key points.`

    let result

    if (provider === "ollama") {
      const ollama = createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      })

      result = await generateObject({
        model: ollama("llama3.2"),
        schema: slideContentSchema,
        prompt,
        temperature: 0.7,
      })
    } else {
      result = await generateObject({
        model: "openai/gpt-4-turbo",
        schema: slideContentSchema,
        prompt,
      })
    }

    return {
      success: true,
      data: result.object,
    }
  } catch (error: any) {
    console.error("Error generating slide content:", error)

    if (error.message?.includes("ECONNREFUSED")) {
      return {
        success: false,
        error: "Cannot connect to Ollama. Make sure Ollama is running on localhost:11434",
      }
    }

    return {
      success: false,
      error: "Failed to generate content",
    }
  }
}

/**
 * Generate a complete presentation with multiple slides
 */
export async function generatePresentation(
  topic: string,
  slideCount = 5,
  provider: "ollama" | "openai" = "ollama"
) {
  try {
    const slides = []

    if (provider === "ollama") {
      const ollama = createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      })

      // Generate title slide
      const titlePrompt = `Create a compelling presentation title and subtitle for a presentation about: "${topic}"`
      const { text: titleContent } = await generateText({
        model: ollama("llama3.2"),
        prompt: titlePrompt,
        temperature: 0.8,
      })

      slides.push({
        id: "1",
        title: topic,
        subtitle: titleContent,
        layout: "title",
        type: "AI Generated",
      })

      // Generate content slides
      for (let i = 2; i <= slideCount; i++) {
        const contentPrompt = `Create slide ${i} of ${slideCount} for a presentation about "${topic}".
Make it a key point or section that builds on the overall narrative.
Format: Return a concise title and 2-3 bullet points.`

        const { object } = await generateObject({
          model: ollama("llama3.2"),
          schema: slideContentSchema,
          prompt: contentPrompt,
          temperature: 0.7,
        })

        slides.push({
          id: String(i),
          title: object.title,
          content: object.content,
          layout: object.layout || "content",
          type: "AI Generated",
        })
      }
    } else {
      // OpenAI fallback
      const titlePrompt = `Create a compelling presentation title and subtitle for a presentation about: "${topic}"`
      const { text: titleContent } = await generateText({
        model: "openai/gpt-4-turbo",
        prompt: titlePrompt,
        temperature: 0.8,
      })

      slides.push({
        id: "1",
        title: "Presentation Title",
        subtitle: titleContent,
        layout: "title",
        type: "AI Generated",
      })

      for (let i = 2; i <= slideCount; i++) {
        const contentPrompt = `Create slide ${i} of ${slideCount} for a presentation about "${topic}".
Make it a key point or section that builds on the overall narrative.
Format: Return a concise title and 2-3 bullet points.`

        const { object } = await generateObject({
          model: "openai/gpt-4-turbo",
          schema: slideContentSchema,
          prompt: contentPrompt,
        })

        slides.push({
          id: String(i),
          title: object.title,
          content: object.content,
          layout: "content",
          type: "AI Generated",
        })
      }
    }

    return {
      success: true,
      slides,
    }
  } catch (error: any) {
    console.error("Error generating presentation:", error)

    if (error.message?.includes("ECONNREFUSED")) {
      return {
        success: false,
        error: "Cannot connect to Ollama. Make sure Ollama is running.",
      }
    }

    return {
      success: false,
      error: "Failed to generate presentation",
    }
  }
}

/**
 * Generate creative title ideas for a topic
 */
export async function generateTitleIdeas(
  topic: string,
  provider: "ollama" | "openai" = "ollama"
) {
  try {
    let text

    if (provider === "ollama") {
      const ollama = createOllama({
        baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      })

      const result = await generateText({
        model: ollama("llama3.2"),
        prompt: `Generate 5 creative and compelling presentation titles for the topic: "${topic}".
Return them as a JSON array of strings. Only return the JSON array, nothing else.`,
        temperature: 0.9,
      })

      text = result.text
    } else {
      const result = await generateText({
        model: "openai/gpt-4-turbo",
        prompt: `Generate 5 creative and compelling presentation titles for the topic: "${topic}".
Return them as a JSON array of strings. Only return the JSON array, nothing else.`,
        temperature: 0.9,
      })

      text = result.text
    }

    const ideas = JSON.parse(text)
    return {
      success: true,
      ideas,
    }
  } catch (error: any) {
    console.error("Error generating title ideas:", error)
    return {
      success: false,
      error: "Failed to generate title ideas",
    }
  }
}
