"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, ZoomIn, ZoomOut, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock presentation data
const mockPresentation = {
  id: 1,
  title: "My Presentation",
  slides: [
    {
      id: 1,
      title: "Slide 1",
      content: "Your content here",
      background: "bg-gradient-to-br from-primary/20 to-accent/20",
    },
    {
      id: 2,
      title: "Slide 2",
      content: "More content",
      background: "bg-gradient-to-br from-secondary/20 to-primary/20",
    },
    {
      id: 3,
      title: "Slide 3",
      content: "Even more content",
      background: "bg-gradient-to-br from-accent/20 to-secondary/20",
    },
  ],
}

export default function ViewerPage() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPresenting, setIsPresenting] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideAnimation, setSlideAnimation] = useState<"enter" | "exit" | null>(null)
  const [showGrid, setShowGrid] = useState(false)

  const currentSlide = mockPresentation.slides[currentSlideIndex]
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

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextSlide()
      if (e.key === "ArrowLeft") handlePrevSlide()
      if (e.key === "f") handleToggleFullscreen()
      if (e.key === "g") setShowGrid(!showGrid)
      if (e.key === "Escape") setIsPresenting(false)
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentSlideIndex, showGrid])

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      {!isPresenting && (
        <div className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">{mockPresentation.title}</h1>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnail Grid */}
        {showGrid && !isPresenting && (
          <div className="w-48 border-r border-border bg-card/30 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-sm">Slides</h3>
            <div className="space-y-2">
              {mockPresentation.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`w-full aspect-video rounded-lg border-2 transition-all overflow-hidden ${
                    currentSlideIndex === index
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card/50"
                  }`}
                >
                  <div className={`${slide.background} w-full h-full flex items-center justify-center`}>
                    <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slide Canvas */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          <div
            key={currentSlide.id}
            className={`${currentSlide.background} w-full h-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl p-16 flex flex-col justify-center transition-all duration-500 ${
              slideAnimation === "enter"
                ? "animate-slide-enter opacity-100 scale-100"
                : slideAnimation === "exit"
                  ? "animate-slide-exit opacity-0 scale-95"
                  : "opacity-100 scale-100"
            }`}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight text-balance">
              {currentSlide.title}
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed text-pretty">{currentSlide.content}</p>
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
            {currentSlideIndex + 1} / {totalSlides}
          </div>
        </div>
      </div>

      {/* Controls */}
      {!isPresenting && (
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
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
            <input
              type="range"
              min="0"
              max={totalSlides - 1}
              value={currentSlideIndex}
              onChange={(e) => goToSlide(Number(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className="gap-2 bg-transparent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToSlide(totalSlides - 1)}
              disabled={currentSlideIndex === totalSlides - 1}
              className="gap-2"
            >
              Last
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)} className="gap-2">
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToggleFullscreen} className="gap-2">
              {isFullscreen ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsPresenting(true)}>
              Present
            </Button>
          </div>
        </div>
      )}

      {/* Presenter Mode Controls */}
      {isPresenting && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-50">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
            className="gap-2 bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => setIsPresenting(false)}>
            Exit Present
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNextSlide}
            disabled={currentSlideIndex === totalSlides - 1}
            className="gap-2 bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Keyboard Hints */}
      {!isPresenting && (
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50">
          <p>Arrow keys: Navigate | F: Fullscreen | G: Grid | Esc: Exit</p>
        </div>
      )}
    </div>
  )
}
