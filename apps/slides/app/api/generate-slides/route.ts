import { generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

const slideSchema = z.object({
  slides: z
    .array(
      z.object({
        title: z.string().describe("The slide title"),
        content: z.string().describe("The slide content/body text"),
        visualStyle: z.enum(["minimal", "bold", "elegant"]).describe("Visual style for the slide"),
        backgroundColor: z.enum(["primary", "secondary", "accent"]).describe("Background color theme"),
      }),
    )
    .describe("Array of generated slides"),
})

export async function POST(req: Request) {
  const { prompt, slideCount = 3 } = await req.json()

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 })
  }

  const { object } = await generateObject({
    model: "openai/gpt-5-mini",
    schema: slideSchema,
    prompt: `Generate ${slideCount} presentation slides for the following topic: "${prompt}". 
    
Each slide should have:
- A compelling title
- Clear, concise content suitable for presentation
- A visual style (minimal, bold, or elegant)
- A background color theme (primary, secondary, or accent)

Make each slide distinct and build a coherent narrative.`,
    maxOutputTokens: 2000,
  })

  return Response.json({
    slides: object.slides.map((slide, index) => ({
      id: Date.now() + index,
      title: slide.title,
      content: slide.content,
      visualStyle: slide.visualStyle,
      backgroundColor: slide.backgroundColor,
    })),
  })
}
