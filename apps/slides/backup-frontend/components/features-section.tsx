"use client"

import { Brain, Zap, Palette, Share2, Sparkles, Lock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Content Generator",
    description:
      "Describe your topic and let AI create compelling slide content, outlines, and talking points automatically.",
  },
  {
    icon: Palette,
    title: "Smart Design Engine",
    description: "Get unique, beautiful layouts that adapt to your content. No design experience needed.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create professional presentations in minutes, not hours. Real-time collaboration included.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share presentations with custom links, live presentations mode, and integrated feedback system.",
  },
  {
    icon: Sparkles,
    title: "Template Intelligence",
    description:
      "AI suggests the perfect template based on your content and automatically fills it with smart layouts.",
  },
  {
    icon: Lock,
    title: "Enterprise Secure",
    description: "End-to-end encryption, SOC 2 compliance, and advanced permission controls.",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Features That Transform Your Presentations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create exceptional presentations without the hassle
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-xl border border-border/40 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300" />
                <div className="relative">
                  <Icon className="h-8 w-8 mb-4 text-primary group-hover:text-accent transition-colors" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
