"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"

interface Slide {
  id: number
  title: string
  content: string
  background: string
}

interface ImmersiveModeProps {
  slides: Slide[]
  currentSlideIndex: number
  onNavigate: (index: number) => void
}

export default function ImmersiveMode({ slides, currentSlideIndex, onNavigate }: ImmersiveModeProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay) return

    const timer = setTimeout(() => {
      if (currentSlideIndex < slides.length - 1) {
        onNavigate(currentSlideIndex + 1)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [currentSlideIndex, autoPlay, slides.length, onNavigate])

  const currentSlide = slides[currentSlideIndex]

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Full screen slide with parallax background */}
      <div
        className={`${currentSlide.background} w-full h-full absolute inset-0 flex items-center justify-center animate-pulse`}
      />

      {/* Animated content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center px-8 py-12">
        <div className="max-w-4xl text-center animate-slide-enter">
          <h1 className="text-7xl md:text-8xl font-bold text-foreground mb-6 leading-tight drop-shadow-lg">
            {currentSlide.title}
          </h1>
          <p className="text-2xl md:text-3xl text-foreground/90 leading-relaxed drop-shadow-md mb-12">
            {currentSlide.content}
          </p>
        </div>

        {/* Progress bars for each slide */}
        <div className="absolute bottom-12 left-0 right-0 px-8">
          <div className="flex gap-2 justify-center max-w-2xl mx-auto">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  index === currentSlideIndex ? "bg-accent" : index < currentSlideIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="px-4 py-2 bg-black/30 hover:bg-black/50 text-white rounded-lg text-sm font-medium transition-all"
          >
            {autoPlay ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="px-3 py-2 bg-black/30 hover:bg-black/50 text-white rounded-lg"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>

        {/* Slide counter */}
        <div className="absolute top-8 left-8 text-white text-lg font-semibold bg-black/30 px-4 py-2 rounded-lg">
          {currentSlideIndex + 1} / {slides.length}
        </div>
      </div>

      {/* Click to navigate */}
      <div
        className="absolute left-0 top-0 w-1/3 h-full cursor-pointer hover:bg-black/10 transition-colors"
        onClick={() => {
          if (currentSlideIndex > 0) onNavigate(currentSlideIndex - 1)
        }}
      />
      <div
        className="absolute right-0 top-0 w-1/3 h-full cursor-pointer hover:bg-black/10 transition-colors"
        onClick={() => {
          if (currentSlideIndex < slides.length - 1) onNavigate(currentSlideIndex + 1)
        }}
      />
    </div>
  )
}
