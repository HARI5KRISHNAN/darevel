"use client"

import { Button } from "@/components/ui/button"
import { Plus, Trash2, Copy } from "lucide-react"

interface Slide {
  id: string
  title: string
  subtitle?: string
  content?: string
  layout: string
  backgroundColor: string
  textColor: string
}

interface SlidesPanelProps {
  slides: Slide[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onDuplicate?: (id: string) => void
}

export default function SlidesPanel({ slides, selectedId, onSelect, onAdd, onDelete, onDuplicate }: SlidesPanelProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Slides</h2>
        <Button variant="ghost" size="sm" onClick={onAdd} className="gap-1 h-8">
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`group relative rounded-lg p-3 cursor-pointer transition-all ${
              selectedId === slide.id
                ? "bg-primary/20 border-2 border-primary"
                : "bg-card border border-border hover:border-primary/50"
            }`}
            onClick={() => onSelect(slide.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-muted-foreground">Slide {index + 1}</div>
                <div className="text-sm font-medium text-foreground truncate">{slide.title}</div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onDuplicate && (
                  <button
                    className="p-1 hover:bg-primary/10 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(slide.id)
                    }}
                    title="Duplicate slide"
                  >
                    <Copy className="h-3 w-3 text-primary" />
                  </button>
                )}
                {slides.length > 1 && (
                  <button
                    className="p-1 hover:bg-destructive/10 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(slide.id)
                    }}
                    title="Delete slide"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
