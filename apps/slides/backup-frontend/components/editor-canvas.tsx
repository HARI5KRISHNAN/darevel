"use client"
import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditorCanvasProps {
  slides: any[]
  activeSlide: number
  onUpdateSlide: (id: number, updates: any) => void
}

export default function EditorCanvas({ slides, activeSlide, onUpdateSlide }: EditorCanvasProps) {
  const slide = slides.find((s) => s.id === activeSlide)

  if (!slide) return null

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
      <div className="w-full max-w-3xl">
        {/* Main slide editing area */}
        <div
          className={`w-full aspect-video rounded-lg bg-gradient-to-br ${slide.bgColor} shadow-2xl shadow-primary/20 p-12 flex flex-col justify-between mb-8 border border-border/50`}
        >
          <div>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdateSlide(slide.id, { title: e.target.value })}
              className="text-4xl font-bold text-white bg-transparent border-b-2 border-white/30 focus:border-white outline-none mb-4 w-full"
              placeholder="Slide title"
            />
          </div>

          <textarea
            value={slide.content}
            onChange={(e) => onUpdateSlide(slide.id, { content: e.target.value })}
            className="text-lg text-white/80 bg-transparent border border-white/20 rounded p-3 focus:border-white outline-none resize-none h-24 mb-4"
            placeholder="Your content here..."
          />

          <div className="flex gap-2">
            <span className="text-sm text-white/60">Slide {slide.id}</span>
          </div>
        </div>

        {/* AI Enhancement button */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
            <Wand2 className="w-4 h-4 mr-2" />
            Enhance with AI
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            Add Elements
          </Button>
        </div>
      </div>
    </div>
  )
}
