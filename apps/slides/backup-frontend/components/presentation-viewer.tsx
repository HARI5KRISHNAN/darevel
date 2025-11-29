"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, X, BarChart3, Download, FileJson, Presentation as PresentationIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { exportAsJSON, exportAsPDF } from "@/lib/export-utils"
import type { Slide as SlideType, Presentation } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import PresenterMode from "./presenter-mode"

interface Slide extends SlideType {
  notes?: string
}

interface PresentationViewerProps {
  slides: Slide[]
  presentationTitle: string
}

export default function PresentationViewer({ slides, presentationTitle }: PresentationViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPresenting, setIsPresenting] = useState(false)
  const [isPresenterMode, setIsPresenterMode] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(5) // seconds
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [slideTransition, setSlideTransition] = useState<'fade' | 'slide'>('slide')

  const currentSlide = slides[currentIndex]

  // Export handlers
  const handleExportJSON = async () => {
    const presentation: Presentation = {
      id: 'exported-presentation',
      title: presentationTitle,
      slides: slides,
    }
    await exportAsJSON(presentation)
  }

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    setExportProgress(0)

    const presentation: Presentation = {
      id: 'exported-presentation',
      title: presentationTitle,
      slides: slides,
    }

    try {
      await exportAsPDF(presentation, (current, total) => {
        setExportProgress(Math.round((current / total) * 100))
      })
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsExportingPDF(false)
      setExportProgress(0)
    }
  }

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

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isPresenting) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, autoPlaySpeed * 1000)

    return () => clearInterval(interval)
  }, [isPlaying, autoPlaySpeed, slides.length, isPresenting])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleGoToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenting) return
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === " ") {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      }
      if (e.key === "Escape") setShowNotes(!showNotes)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, isPresenting, showNotes])

  // Show presenter mode
  if (isPresenterMode) {
    return (
      <PresenterMode
        slides={slides}
        initialSlideIndex={currentIndex}
        onExit={() => setIsPresenterMode(false)}
      />
    )
  }

  // Show fullscreen presentation
  if (isPresenting) {
    return (
      <PresentationMode
        slide={currentSlide}
        onExit={() => setIsPresenting(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{presentationTitle}</h1>
          <div className="text-sm text-muted-foreground">
            Slide {currentIndex + 1} of {slides.length}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Main viewer */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden mb-4 flex items-center justify-center p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={
                  slideTransition === 'fade'
                    ? { opacity: 0 }
                    : { x: 100, opacity: 0 }
                }
                animate={{ x: 0, opacity: 1 }}
                exit={
                  slideTransition === 'fade'
                    ? { opacity: 0 }
                    : { x: -100, opacity: 0 }
                }
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full h-full max-w-4xl aspect-video rounded-lg shadow-2xl flex flex-col justify-center absolute"
                style={{
                  ...getBackgroundStyle(currentSlide),
                  color: currentSlide.textColor,
                  fontFamily: currentSlide.fontFamily || 'system-ui',
                }}
              >
                {currentSlide.layout === "title" ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6 px-12 text-center">
                    <h1
                      className="font-bold leading-tight"
                      style={{
                        fontSize: `${currentSlide.titleFontSize || 72}px`,
                        letterSpacing: currentSlide.letterSpacing ? `${currentSlide.letterSpacing}px` : undefined,
                      }}
                    >
                      {currentSlide.title}
                    </h1>
                    {currentSlide.subtitle && (
                      <p
                        className="opacity-75"
                        style={{
                          fontSize: `${(currentSlide.contentFontSize || 32) * 0.7}px`,
                        }}
                      >
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full p-12 gap-6">
                    <h2
                      className="font-bold"
                      style={{
                        fontSize: `${(currentSlide.titleFontSize || 72) * 0.8}px`,
                      }}
                    >
                      {currentSlide.title}
                    </h2>
                    <div
                      className="flex-1 leading-relaxed whitespace-pre-wrap overflow-y-auto"
                      style={{
                        fontSize: `${currentSlide.contentFontSize || 28}px`,
                        lineHeight: currentSlide.lineHeight || 1.6,
                        letterSpacing: currentSlide.letterSpacing ? `${currentSlide.letterSpacing}px` : undefined,
                      }}
                    >
                      {currentSlide.content}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button onClick={handlePrev} variant="outline" size="sm" className="gap-2 bg-transparent">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} variant="outline" size="sm" className="gap-2 bg-transparent">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={() => setCurrentIndex(0)} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant={isPlaying ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              {isPlaying && (
                <select
                  value={autoPlaySpeed}
                  onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
                  className="h-8 text-xs px-2 rounded border border-border bg-background text-foreground"
                >
                  <option value="2">2s</option>
                  <option value="3">3s</option>
                  <option value="5">5s</option>
                  <option value="10">10s</option>
                </select>
              )}

              <Button
                onClick={() => setShowNotes(!showNotes)}
                variant={showNotes ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Notes
              </Button>

              {/* Transition selector */}
              <select
                value={slideTransition}
                onChange={(e) => setSlideTransition(e.target.value as 'fade' | 'slide')}
                className="h-8 text-xs px-2 rounded border border-border bg-background text-foreground"
                title="Slide transition effect"
              >
                <option value="slide">Slide</option>
                <option value="fade">Fade</option>
              </select>

              {/* Export buttons */}
              <Button
                onClick={handleExportJSON}
                variant="outline"
                size="sm"
                className="gap-2"
                title="Export as JSON"
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>

              <Button
                onClick={handleExportPDF}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isExportingPDF}
                title="Export as PDF"
              >
                <Download className="h-4 w-4" />
                {isExportingPDF ? 'Exporting...' : 'PDF'}
              </Button>

              <Button
                onClick={() => setIsPresenterMode(true)}
                variant="outline"
                size="sm"
                className="gap-2"
                title="Open presenter view with notes"
              >
                <PresentationIcon className="h-4 w-4" />
                Presenter
              </Button>

              <Button
                onClick={() => setIsPresenting(true)}
                size="sm"
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Play className="h-4 w-4" />
                Present
              </Button>
            </div>
          </div>

          {/* PDF Export Progress */}
          {isExportingPDF && (
            <div className="mt-4 p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Exporting PDF...</span>
                <span className="text-xs text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Thumbnails sidebar */}
        <div className="w-40 bg-card rounded-lg border border-border overflow-y-auto p-3 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Slides</h3>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => handleGoToSlide(index)}
              className={`w-full rounded-lg overflow-hidden transition-all ${
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
                <div className="text-xs font-semibold truncate px-1">{slide.title}</div>
              </div>
              <div className="text-xs text-muted-foreground p-1 text-center bg-background">{index + 1}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && (
        <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="font-semibold text-foreground mb-2">Speaker Notes</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {currentSlide.notes || "No notes for this slide"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

interface PresentationModeProps {
  slide: Slide
  onExit: () => void
  onNext: () => void
  onPrev: () => void
}

function PresentationMode({ slide, onExit, onNext, onPrev }: PresentationModeProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        onNext()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        onPrev()
      }
      if (e.key === "Escape") {
        onExit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onNext, onPrev, onExit])

  // Get background style for presentation mode
  const getBackgroundStyle = () => {
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

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center cursor-none"
      style={{
        ...getBackgroundStyle(),
        color: slide.textColor,
        fontFamily: slide.fontFamily || 'system-ui',
      }}
      onClick={onNext}
    >
      {slide.layout === "title" ? (
        <div className="flex flex-col items-center justify-center gap-8 text-center px-12">
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: `${slide.titleFontSize || 96}px`,
              letterSpacing: slide.letterSpacing ? `${slide.letterSpacing}px` : undefined,
            }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p
              className="opacity-75"
              style={{
                fontSize: `${(slide.contentFontSize || 48) * 0.7}px`,
              }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col w-full h-full p-16 gap-8 justify-center">
          <h2
            className="font-bold"
            style={{
              fontSize: `${(slide.titleFontSize || 96) * 0.8}px`,
            }}
          >
            {slide.title}
          </h2>
          <div
            className="leading-relaxed flex-1 whitespace-pre-wrap"
            style={{
              fontSize: `${slide.contentFontSize || 36}px`,
              lineHeight: slide.lineHeight || 1.6,
              letterSpacing: slide.letterSpacing ? `${slide.letterSpacing}px` : undefined,
            }}
          >
            {slide.content}
          </div>
        </div>
      )}

      {/* Exit button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onExit()
        }}
        className="fixed top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Navigation hints */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm opacity-50">
        Arrow keys to navigate • ESC to exit
      </div>
    </div>
  )
}
