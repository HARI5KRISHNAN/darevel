"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import AIAssistPanel from "@/components/ai-assist-panel"
import OllamaAIAssistant from "@/components/ollama-ai-assistant"
import TemplateSelector from "@/components/template-selector"
import MediaUploadPanel from "@/components/media-upload-panel"
import ShapesPanel from "@/components/shapes-panel"
import type { Template } from "@/lib/templates"

interface Slide {
  id: string
  title: string
  subtitle?: string
  content?: string
  layout: string
  backgroundColor: string
  textColor: string
  titleFontSize?: number
  contentFontSize?: number
  fontFamily?: string
  letterSpacing?: number
  lineHeight?: number
  textColumns?: number
  image?: {
    url: string
    position?: "left" | "right" | "full" | "background"
  }
  attachments?: Array<{ id: string; name: string; url: string; type: "image" | "pdf" | "file" }>
  shapes?: Array<{
    id: string
    type: "2d" | "3d"
    shapeId: string
    x: number
    y: number
    width: number
    height: number
    color: string
    rotation: number
  }>
}

interface PropertiesPanelProps {
  slide: Slide
  onUpdate: (updates: any) => void
  onApplyTemplate?: (template: Template, allSlides: boolean) => void
}

export default function PropertiesPanel({ slide, onUpdate, onApplyTemplate }: PropertiesPanelProps) {
  const [showAI, setShowAI] = useState(false)

  const handleContentGenerated = (content: { title: string; content: string }) => {
    onUpdate({
      title: content.title,
      content: content.content,
    })
    setShowAI(false)
  }

  const handleTemplateSelect = (template: Template) => {
    onUpdate({
      backgroundColor: template.styles.backgroundColor,
      textColor: template.styles.textColor,
    })
  }

  const handleImageUpload = (imageUrl: string, position: string) => {
    onUpdate({
      image: {
        url: imageUrl,
        position,
      },
    })
  }

  const handleAttachmentUpload = (file: { name: string; url: string; type: "image" | "pdf" | "file" }) => {
    const attachment = {
      id: Date.now().toString(),
      ...file,
    }
    onUpdate({
      attachments: [...(slide.attachments || []), attachment],
    })
  }

  const handleRemoveAttachment = (id: string) => {
    onUpdate({
      attachments: slide.attachments?.filter((a) => a.id !== id) || [],
    })
  }

  const handleRemoveImage = () => {
    onUpdate({
      image: undefined,
    })
  }

  const handleShapeSelect = (shapeId: string, shapeType: "2d" | "3d") => {
    const newShape = {
      id: Date.now().toString(),
      type: shapeType,
      shapeId,
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      color: "#a855f7",
      rotation: 0,
    }
    onUpdate({
      shapes: [...(slide.shapes || []), newShape],
    })
  }

  return (
    <div className="flex flex-col p-4 gap-4 h-full overflow-y-auto">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-6 text-xs">
          <TabsTrigger value="properties" className="text-xs">
            Props
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            Text
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            AI
          </TabsTrigger>
          <TabsTrigger value="shapes" className="text-xs">
            Shapes
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            Media
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Slide Properties</h3>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Layout</Label>
              <Select value={slide.layout} onValueChange={(value) => onUpdate({ layout: value })}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title Slide</SelectItem>
                  <SelectItem value="content">Content Slide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-4">
              <Label className="text-sm text-muted-foreground">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={slide.backgroundColor}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="h-8 w-12 p-0 border cursor-pointer"
                />
                <Input
                  type="text"
                  value={slide.backgroundColor}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label className="text-sm text-muted-foreground">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={slide.textColor}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  className="h-8 w-12 p-0 border cursor-pointer"
                />
                <Input
                  type="text"
                  value={slide.textColor}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                  className="h-8 text-xs flex-1"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <AIAssistPanel onContentGenerated={handleContentGenerated} />
            </div>

            <div className="pt-4 border-t border-border space-y-3 mt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Formatting</h4>
              <button className="w-full text-left text-sm p-2 rounded hover:bg-primary/10 text-foreground">
                Bold (Ctrl+B)
              </button>
              <button className="w-full text-left text-sm p-2 rounded hover:bg-primary/10 text-foreground">
                Italic (Ctrl+I)
              </button>
              <button className="w-full text-left text-sm p-2 rounded hover:bg-primary/10 text-foreground">
                Underline (Ctrl+U)
              </button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Text Properties</h3>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Font Family</Label>
              <Select
                value={slide.fontFamily || "system-ui"}
                onValueChange={(value) => onUpdate({ fontFamily: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system-ui">System UI</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                  <SelectItem value="cursive">Cursive</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <Label className="text-sm text-muted-foreground">Title Font Size: {slide.titleFontSize || 48}px</Label>
                <Slider
                  min={20}
                  max={100}
                  step={2}
                  value={[slide.titleFontSize || 48]}
                  onValueChange={(value) => onUpdate({ titleFontSize: value[0] })}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Content Font Size: {slide.contentFontSize || 18}px
                </Label>
                <Slider
                  min={10}
                  max={48}
                  step={1}
                  value={[slide.contentFontSize || 18]}
                  onValueChange={(value) => onUpdate({ contentFontSize: value[0] })}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Line Height: {slide.lineHeight || 1.5}</Label>
                <Slider
                  min={0.8}
                  max={2.5}
                  step={0.1}
                  value={[slide.lineHeight || 1.5]}
                  onValueChange={(value) => onUpdate({ lineHeight: value[0] })}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Letter Spacing: {slide.letterSpacing || 0}px</Label>
                <Slider
                  min={-2}
                  max={8}
                  step={0.5}
                  value={[slide.letterSpacing || 0]}
                  onValueChange={(value) => onUpdate({ letterSpacing: value[0] })}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Text Columns: {slide.textColumns || 1}</Label>
                <Slider
                  min={1}
                  max={3}
                  step={1}
                  value={[slide.textColumns || 1]}
                  onValueChange={(value) => onUpdate({ textColumns: value[0] })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <OllamaAIAssistant onSlideGenerated={handleContentGenerated} />
        </TabsContent>

        <TabsContent value="shapes" className="space-y-4">
          <ShapesPanel onShapeSelect={handleShapeSelect} />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaUploadPanel
            onImageUpload={handleImageUpload}
            onAttachmentUpload={handleAttachmentUpload}
            currentImage={slide.image?.url}
            attachments={slide.attachments}
            onRemoveAttachment={handleRemoveAttachment}
            onRemoveImage={handleRemoveImage}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateSelector onSelect={handleTemplateSelect} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
