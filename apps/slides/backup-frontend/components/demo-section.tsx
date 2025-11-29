"use client"

import { Play } from "lucide-react"

export default function DemoSection() {
  return (
    <section id="demo" className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">See Lumina in Action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how you can create a complete presentation in just a few minutes
          </p>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-border/40 bg-card/50">
          <div className="aspect-video bg-gradient-to-br from-card to-background flex items-center justify-center">
            <button className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-all" />
              <div className="relative bg-primary rounded-full p-4">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </button>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Describe Your Topic", desc: "Tell Lumina what your presentation is about" },
            { step: "2", title: "AI Generates Content", desc: "Get unique slides with smart content in seconds" },
            { step: "3", title: "Refine & Present", desc: "Customize and share your professional presentation" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent mb-4">
                <span className="text-sm font-bold text-primary-foreground">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
