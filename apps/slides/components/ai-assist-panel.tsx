"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateSlideContent } from "@/app/actions/ai-actions"
import { Sparkles, Loader } from "lucide-react"

interface AIAssistPanelProps {
  onContentGenerated: (content: { title: string; content: string }) => void
}

export default function AIAssistPanel({ onContentGenerated }: AIAssistPanelProps) {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    try {
      const result = await generateSlideContent(topic)
      if (result.success) {
        onContentGenerated({
          title: result.data.title,
          content: result.data.content,
        })
        setTopic("")
        setShowPrompt(false)
      }
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!showPrompt ? (
        <Button
          onClick={() => setShowPrompt(true)}
          className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      ) : (
        <div className="space-y-3 p-3 border border-primary/20 rounded-lg bg-primary/5">
          <div className="text-sm font-medium text-foreground">What topic for this slide?</div>
          <Input
            placeholder="E.g., Market trends, Product benefits..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
            disabled={isLoading}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={!topic.trim() || isLoading} size="sm" className="flex-1 gap-1">
              {isLoading ? (
                <>
                  <Loader className="h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
            <Button
              onClick={() => {
                setShowPrompt(false)
                setTopic("")
              }}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
