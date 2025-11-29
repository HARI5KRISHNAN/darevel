"use client"

import { Button } from "@/components/ui/button"

interface InteractiveSlideProps {
  slide: any
  onChoiceMade: (nextSlideId: string) => void
}

export default function InteractiveSlide({ slide, onChoiceMade }: InteractiveSlideProps) {
  if (!slide.isBranching) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div
          className={`${slide.background} w-full max-w-4xl aspect-video rounded-xl shadow-2xl p-12 border border-border/50 flex flex-col justify-center`}
        >
          <h2 className="text-5xl font-bold text-foreground mb-8">{slide.title}</h2>
          <p className="text-xl text-foreground/80 leading-relaxed">{slide.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-foreground mb-4">{slide.title}</h2>
          <p className="text-lg text-foreground/70">{slide.content}</p>
        </div>

        <div className="space-y-3 pt-8">
          {(slide.choices || []).map((choice: any) => (
            <Button
              key={choice.id}
              onClick={() => onChoiceMade(choice.nextSlideId)}
              className="w-full py-6 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 text-foreground font-semibold"
            >
              {choice.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
