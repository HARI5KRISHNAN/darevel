"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import ModeSelector from "@/components/viewer/mode-selector"
import CanvasMode from "@/components/viewer/canvas-mode"
import FlowMode from "@/components/viewer/flow-mode"
import ImmersiveMode from "@/components/viewer/immersive-mode"
import InteractiveSlide from "@/components/viewer/interactive-slide"

// Mock presentation data
const mockPresentation = {
  id: 1,
  title: "My Presentation",
  slides: [
    {
      id: 1,
      title: "Welcome",
      content: "Start your journey here",
      background: "bg-gradient-to-br from-primary/20 to-accent/20",
      isBranching: false,
    },
    {
      id: 2,
      title: "Key Insights",
      content: "Discover important trends",
      background: "bg-gradient-to-br from-secondary/20 to-primary/20",
      isBranching: false,
    },
    {
      id: 3,
      title: "Strategy",
      content: "Our approach to success",
      background: "bg-gradient-to-br from-accent/20 to-secondary/20",
      isBranching: true,
    },
    {
      id: 4,
      title: "Results",
      content: "Measurable outcomes and impact",
      background: "bg-gradient-to-br from-primary/20 to-secondary/20",
      isBranching: false,
    },
  ],
}

export default function PresentationModesPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [mode, setMode] = useState<"canvas" | "flow" | "immersive">("canvas")
  const [slideAnimation, setSlideAnimation] = useState<"enter" | "exit" | null>(null)

  const totalSlides = mockPresentation.slides.length

  const handleNextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setSlideAnimation("exit")
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex + 1)
        setSlideAnimation("enter")
      }, 300)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setSlideAnimation("exit")
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex - 1)
        setSlideAnimation("enter")
      }, 300)
    }
  }

  const goToSlide = (index: number) => {
    setSlideAnimation("exit")
    setTimeout(() => {
      setCurrentSlideIndex(index)
      setSlideAnimation("enter")
    }, 300)
  }

  const handleBranchChoice = (nextSlideId: string) => {
    const targetIndex = mockPresentation.slides.findIndex((s) => s.id == nextSlideId)
    if (targetIndex !== -1) {
      goToSlide(targetIndex)
    }
  }

  const currentSlide = mockPresentation.slides[currentSlideIndex]
  const isInteractiveSlide = currentSlide?.isBranching

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextSlide()
      if (e.key === "ArrowLeft") handlePrevSlide()
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentSlideIndex])

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mockPresentation.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</p>
        </div>
        <ModeSelector currentMode={mode} onModeChange={setMode} />
      </div>

      {/* Main Content - Mode-specific */}
      <div className="flex-1 flex overflow-hidden relative">
        {isInteractiveSlide ? (
          <InteractiveSlide slide={currentSlide} onChoiceMade={handleBranchChoice} />
        ) : mode === "canvas" ? (
          <CanvasMode slides={mockPresentation.slides} currentSlideIndex={currentSlideIndex} />
        ) : mode === "flow" ? (
          <FlowMode slides={mockPresentation.slides} currentSlideIndex={currentSlideIndex} onSelectSlide={goToSlide} />
        ) : (
          <ImmersiveMode
            slides={mockPresentation.slides}
            currentSlideIndex={currentSlideIndex}
            onNavigate={goToSlide}
          />
        )}
      </div>

      {/* Footer Navigation - Hidden in Immersive mode */}
      {mode !== "immersive" && (
        <div className="border-t border-border bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToSlide(0)}
              disabled={currentSlideIndex === 0}
              className="gap-2"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm text-muted-foreground">
            {currentSlideIndex + 1} of {totalSlides}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="gap-2 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToSlide(totalSlides - 1)}
              disabled={currentSlideIndex === totalSlides - 1}
              className="gap-2"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
