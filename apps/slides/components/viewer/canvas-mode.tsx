"use client"

import { useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Slide {
  id: number
  title: string
  content: string
  background: string
}

interface CanvasModeProps {
  slides: Slide[]
  currentSlideIndex: number
}

export default function CanvasMode({ slides, currentSlideIndex }: CanvasModeProps) {
  const [zoom, setZoom] = useState(100)
  const slide = slides[currentSlideIndex]

  const handleZoom = (delta: number) => {
    setZoom(Math.max(50, Math.min(200, zoom + delta)))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Canvas Toolbar */}
      <div className="border-b border-border bg-card/50 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleZoom(-10)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <Button variant="ghost" size="sm" onClick={() => handleZoom(10)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 text-sm text-muted-foreground text-center">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-8">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
          className="transition-transform duration-200"
        >
          <div
            className={`${slide.background} w-96 h-56 rounded-xl shadow-2xl p-8 flex flex-col justify-center border border-border/50`}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{slide.title}</h2>
            <p className="text-sm text-foreground/80">{slide.content}</p>
          </div>
        </div>
      </div>

      {/* Canvas Info */}
      <div className="border-t border-border bg-card/50 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Canvas Mode: Zoom and pan freely. Use scroll to navigate content.
        </p>
      </div>
    </div>
  )
}
