"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Download, Share2, Save, Sparkles } from "lucide-react"
import { generatePresentation } from "@/app/actions/ai-actions"

interface EditorHeaderProps {
  onGenerateFull?: (slides: any[]) => void
}

export default function EditorHeader({ onGenerateFull }: EditorHeaderProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePresentation = async () => {
    setIsGenerating(true)
    try {
      const result = await generatePresentation("Business Presentation", 5)
      if (result.success && onGenerateFull) {
        onGenerateFull(result.slides)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Untitled Presentation</h1>
            <p className="text-xs text-muted-foreground">Last edited 2 mins ago</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleGeneratePresentation}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "AI Presentation"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </header>
  )
}
