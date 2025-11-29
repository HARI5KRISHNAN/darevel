"use client"

import { ChevronRight } from "lucide-react"

interface Slide {
  id: number
  title: string
  content: string
  background: string
}

interface FlowModeProps {
  slides: Slide[]
  currentSlideIndex: number
  onSelectSlide: (index: number) => void
}

export default function FlowMode({ slides, currentSlideIndex, onSelectSlide }: FlowModeProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Timeline */}
      <div className="w-80 border-r border-border bg-card/30 overflow-y-auto p-6">
        <h3 className="font-semibold mb-6">Presentation Timeline</h3>
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => onSelectSlide(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all group ${
                currentSlideIndex === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 bg-card/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    currentSlideIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{slide.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{slide.content}</p>
                </div>
                {currentSlideIndex === index && <ChevronRight className="flex-shrink-0 h-4 w-4 text-primary mt-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Slide */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-muted/30 p-8">
        <div
          className={`${slides[currentSlideIndex].background} w-full max-w-4xl aspect-video rounded-2xl shadow-2xl p-16 flex flex-col justify-center border border-border/50 animate-slide-enter`}
        >
          <h1 className="text-5xl font-bold text-foreground mb-8">{slides[currentSlideIndex].title}</h1>
          <p className="text-xl text-foreground/80 leading-relaxed">{slides[currentSlideIndex].content}</p>

          {/* Progress indicator */}
          <div className="mt-12 w-full bg-black/20 rounded-full h-1 overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
