"use client"

import { Cannabis as Canvas, Zap, Focus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModeSelectorProps {
  currentMode: "canvas" | "flow" | "immersive"
  onModeChange: (mode: "canvas" | "flow" | "immersive") => void
}

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-card/50 border border-border rounded-lg p-2">
      <Button
        variant={currentMode === "canvas" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("canvas")}
        className="gap-2"
      >
        <Canvas className="h-4 w-4" />
        Canvas
      </Button>
      <Button
        variant={currentMode === "flow" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("flow")}
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        Flow
      </Button>
      <Button
        variant={currentMode === "immersive" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("immersive")}
        className="gap-2"
      >
        <Focus className="h-4 w-4" />
        Immersive
      </Button>
    </div>
  )
}
