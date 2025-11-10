"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <div className="relative pt-32 pb-20">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">Powered by Advanced AI</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-balance">
          <span className="glow-text">Presentations That Tell Your Story</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Stop creating boring presentations. Lumina uses AI to generate stunning visuals, smart content, and unique
          designs. Just describe your idea—we handle the rest.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2">
              Start Creating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 pt-12 border-t border-border/40">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">10K+</div>
            <div className="text-sm text-muted-foreground">Presentations Created</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">5M+</div>
            <div className="text-sm text-muted-foreground">Slides Generated</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">98%</div>
            <div className="text-sm text-muted-foreground">User Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  )
}
