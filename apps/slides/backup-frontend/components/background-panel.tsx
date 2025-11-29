"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Image as ImageIcon, Sparkles } from "lucide-react"

interface BackgroundPanelProps {
  currentBackground: string
  currentGradient?: {
    type: "linear" | "radial"
    colors: string[]
    angle?: number
  }
  onUpdateBackground: (color: string) => void
  onUpdateGradient: (gradient: { type: "linear" | "radial"; colors: string[]; angle?: number } | undefined) => void
}

const PRESET_GRADIENTS = [
  {
    name: "Sunset",
    type: "linear" as const,
    colors: ["#ff6b6b", "#ee5a6f", "#c44569"],
    angle: 135,
  },
  {
    name: "Ocean",
    type: "linear" as const,
    colors: ["#0c4a6e", "#0369a1", "#38bdf8"],
    angle: 135,
  },
  {
    name: "Forest",
    type: "linear" as const,
    colors: ["#15803d", "#166534", "#4ade80"],
    angle: 135,
  },
  {
    name: "Purple",
    type: "linear" as const,
    colors: ["#a76bcf", "#7c3aed", "#00d9ff"],
    angle: 135,
  },
  {
    name: "Fire",
    type: "linear" as const,
    colors: ["#d97706", "#ea580c", "#fbbf24"],
    angle: 135,
  },
  {
    name: "Neon",
    type: "linear" as const,
    colors: ["#1a0b2e", "#4a0e4e", "#f0abfc"],
    angle: 135,
  },
]

export default function BackgroundPanel({
  currentBackground,
  currentGradient,
  onUpdateBackground,
  onUpdateGradient,
}: BackgroundPanelProps) {
  const [gradientColor1, setGradientColor1] = useState(currentGradient?.colors[0] || "#a76bcf")
  const [gradientColor2, setGradientColor2] = useState(currentGradient?.colors[1] || "#00d9ff")
  const [gradientAngle, setGradientAngle] = useState(currentGradient?.angle || 135)

  const handleApplyGradient = () => {
    onUpdateGradient({
      type: "linear",
      colors: [gradientColor1, gradientColor2],
      angle: gradientAngle,
    })
  }

  const handleClearGradient = () => {
    onUpdateGradient(undefined)
  }

  const handlePresetGradient = (gradient: typeof PRESET_GRADIENTS[0]) => {
    onUpdateGradient(gradient)
    setGradientColor1(gradient.colors[0])
    setGradientColor2(gradient.colors[1])
    setGradientAngle(gradient.angle || 135)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Background</h3>
      </div>

      <Tabs defaultValue="solid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solid" className="text-xs">
            <Palette className="h-3 w-3 mr-1" />
            Solid
          </TabsTrigger>
          <TabsTrigger value="gradient" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Gradient
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-sm">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={currentBackground}
                onChange={(e) => onUpdateBackground(e.target.value)}
                className="h-10 w-16 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={currentBackground}
                onChange={(e) => onUpdateBackground(e.target.value)}
                className="flex-1 text-sm"
                placeholder="#000000"
              />
            </div>
          </div>

          {currentGradient && (
            <Button
              onClick={handleClearGradient}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Gradient
            </Button>
          )}
        </TabsContent>

        <TabsContent value="gradient" className="space-y-4 mt-4">
          {/* Preset Gradients */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_GRADIENTS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetGradient(preset)}
                  className="h-12 rounded-md border border-border hover:ring-2 hover:ring-primary transition-all"
                  style={{
                    background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})`,
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Gradient */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Custom Gradient</Label>

            <div className="space-y-2">
              <Label className="text-xs">Color 1</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={gradientColor1}
                  onChange={(e) => setGradientColor1(e.target.value)}
                  className="h-8 w-12 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={gradientColor1}
                  onChange={(e) => setGradientColor1(e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Color 2</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={gradientColor2}
                  onChange={(e) => setGradientColor2(e.target.value)}
                  className="h-8 w-12 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={gradientColor2}
                  onChange={(e) => setGradientColor2(e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Angle: {gradientAngle}°</Label>
              <Input
                type="range"
                min="0"
                max="360"
                step="15"
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Preview */}
            <div
              className="h-16 rounded-md border border-border"
              style={{
                background: `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`,
              }}
            />

            <Button onClick={handleApplyGradient} className="w-full" size="sm">
              Apply Gradient
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
