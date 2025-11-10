"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface EditorSidebarProps {
  slides: any[]
  activeSlide: number
  onSelectSlide: (id: number) => void
  onAddSlide: () => void
  onDeleteSlide: (id: number) => void
}

export default function EditorSidebar({
  slides,
  activeSlide,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
}: EditorSidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card/50 backdrop-blur flex flex-col">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onAddSlide}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Slide
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`group relative p-3 rounded-lg border cursor-pointer transition-all ${
              activeSlide === slide.id
                ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/30 bg-card/30"
            }`}
            onClick={() => onSelectSlide(slide.id)}
          >
            <div
              className={`w-full h-24 rounded-md bg-gradient-to-br ${slide.bgColor} mb-2 flex items-center justify-center text-white font-bold`}
            >
              Slide {slide.id}
            </div>
            <p className="text-xs font-medium truncate">{slide.title}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteSlide(slide.id)
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-destructive/20"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
