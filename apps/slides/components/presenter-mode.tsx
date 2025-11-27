"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Timer, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Slide } from "@/lib/types"

interface PresenterModeProps {
  slides: Slide[]
  initialSlideIndex?: number
  onExit: () => void
}

export default function PresenterMode({ slides, initialSlideIndex = 0, onExit }: PresenterModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  const currentSlide = slides[currentIndex]
  const nextSlide = slides[currentIndex + 1]

  // Timer
  useEffect(() => {
    if (!isTimerRunning) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Navigation
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        handleNext()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      }
      if (e.key === "Escape") {
        onExit()
      }
      if (e.key === "t" || e.key === "T") {
        setIsTimerRunning(!isTimerRunning)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, isTimerRunning])

  // Helper function to get background style
  const getBackgroundStyle = (slide: Slide) => {
    if (slide.image?.position === 'background') {
      return {
        backgroundImage: `url(${slide.image.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }

    if (slide.gradient) {
      const { type, colors, angle } = slide.gradient
      if (type === 'linear') {
        return {
          background: `linear-gradient(${angle || 135}deg, ${colors.join(', ')})`,
        }
      } else if (type === 'radial') {
        return {
          background: `radial-gradient(circle, ${colors.join(', ')})`,
        }
      }
    }

    return {
      backgroundColor: slide.backgroundColor,
    }
  }

  // Render slide content
  const renderSlideContent = (slide: Slide, isPreview = false) => {
    const scale = isPreview ? 0.4 : 0.6
    const titleSize = isPreview ? (slide.titleFontSize || 72) * scale : (slide.titleFontSize || 72) * scale
    const contentSize = isPreview ? (slide.contentFontSize || 28) * scale : (slide.contentFontSize || 28) * scale

    return (
      <div
        className="w-full h-full rounded-lg shadow-2xl flex flex-col justify-center"
        style={{
          ...getBackgroundStyle(slide),
          color: slide.textColor,
          fontFamily: slide.fontFamily || 'system-ui',
        }}
      >
        {slide.layout === "title" ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 px-12 text-center">
            <h1
              className="font-bold leading-tight"
              style={{
                fontSize: `${titleSize}px`,
                letterSpacing: slide.letterSpacing ? `${slide.letterSpacing}px` : undefined,
              }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p
                className="opacity-75"
                style={{
                  fontSize: `${contentSize * 0.7}px`,
                }}
              >
                {slide.subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full p-12 gap-6">
            <h2
              className="font-bold"
              style={{
                fontSize: `${titleSize * 0.8}px`,
              }}
            >
              {slide.title}
            </h2>
            <div
              className="flex-1 leading-relaxed whitespace-pre-wrap overflow-y-auto"
              style={{
                fontSize: `${contentSize}px`,
                lineHeight: slide.lineHeight || 1.6,
                letterSpacing: slide.letterSpacing ? `${slide.letterSpacing}px` : undefined,
              }}
            >
              {slide.content}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-foreground">Presenter Mode</h1>
          <div className="text-sm text-muted-foreground">
            Slide {currentIndex + 1} of {slides.length}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
            <Timer className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm font-semibold text-foreground">{formatTime(elapsedTime)}</span>
            <Button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>

          {/* Exit */}
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
            <X className="h-4 w-4" />
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Column - Current Slide + Speaker Notes */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Current Slide */}
          <div className="flex-1 bg-card rounded-lg border border-border p-6 flex items-center justify-center">
            <div className="w-full h-full aspect-video max-w-4xl">
              {renderSlideContent(currentSlide)}
            </div>
          </div>

          {/* Speaker Notes */}
          <div className="h-48 bg-card rounded-lg border border-border p-4 overflow-y-auto">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>Speaker Notes</span>
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {currentSlide.notes || "No notes for this slide"}
            </p>
          </div>
        </div>

        {/* Right Column - Next Slide Preview + Controls */}
        <div className="w-80 flex flex-col gap-4">
          {/* Next Slide Preview */}
          <div className="flex-1 bg-card rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Next Slide</h3>
            <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center">
              {nextSlide ? (
                renderSlideContent(nextSlide, true)
              ) : (
                <div className="text-sm text-muted-foreground">Last slide</div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Controls</h3>

            <div className="flex gap-2">
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentIndex === slides.length - 1}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="pt-3 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Shortcuts</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Next slide:</span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous slide:</span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">←</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle timer:</span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">T</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Exit:</span>
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Slide List */}
          <div className="flex-1 bg-card rounded-lg border border-border p-3 overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">All Slides</h3>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full rounded-lg overflow-hidden transition-all text-left ${
                    currentIndex === index ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-primary/50"
                  }`}
                >
                  <div
                    className="aspect-video flex items-center justify-center text-center"
                    style={{
                      backgroundColor: slide.backgroundColor,
                      color: slide.textColor,
                    }}
                  >
                    <div className="text-[10px] font-semibold truncate px-1">{slide.title}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground p-1 text-center bg-background">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
