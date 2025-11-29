"use client"

import type { ReactNode } from "react"
import EditorHeader from "@/components/editor-header"

interface EditorLayoutProps {
  slidesPanel: ReactNode
  canvas: ReactNode
  properties: ReactNode
}

export default function EditorLayout({ slidesPanel, canvas, properties }: EditorLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Left sidebar - Slides */}
        <div className="w-64 bg-card rounded-lg border border-border overflow-auto">{slidesPanel}</div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-card rounded-lg border border-border p-8 overflow-auto">{canvas}</div>

        {/* Right sidebar - Properties */}
        <div className="w-80 bg-card rounded-lg border border-border overflow-auto">{properties}</div>
      </div>
    </div>
  )
}
