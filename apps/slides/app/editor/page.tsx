"use client"

import { useEffect, useCallback } from "react"
import SlideCanvas from "@/components/slide-canvas"
import SlidesPanel from "@/components/slides-panel"
import PropertiesPanel from "@/components/properties-panel"
import EditorTopbar from "@/components/editor-topbar"
import MultiCursor from "@/components/multi-cursor"
import CollaboratorsPanel from "@/components/collaborators-panel"
import { useEditorStore } from "@/lib/store"
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts"
import { useCollaboration } from "@/lib/hooks/use-collaboration"
import { useSupabaseSync } from "@/lib/hooks/use-supabase-sync"
import type { Template } from "@/lib/templates"

export default function EditorPage() {
  const {
    presentation,
    selectedSlideId,
    setSelectedSlideId,
    updateSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    applyTemplateToSlide,
    applyTemplateToAll,
    replaceAllSlides,
  } = useEditorStore()

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Enable Supabase auto-sync
  useSupabaseSync()

  // Initialize collaboration
  const {
    collaborators,
    currentUser,
    isConnected,
    updateCursorPosition,
    updateCurrentSlide,
    cleanup,
  } = useCollaboration({
    presentationId: presentation.id,
  })

  const selectedSlide = presentation.slides.find((s) => s.id === selectedSlideId)

  // Update current slide in collaboration
  useEffect(() => {
    if (selectedSlideId && presentation.slides.length > 0) {
      const slideIndex = presentation.slides.findIndex((s) => s.id === selectedSlideId)
      if (slideIndex !== -1) {
        updateCurrentSlide(slideIndex)
      }
    }
  }, [selectedSlideId, presentation.slides])

  // Track mouse movement for cursor position
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      updateCursorPosition({
        x: e.clientX,
        y: e.clientY,
      })
    },
    [updateCursorPosition]
  )

  useEffect(() => {
    // Throttle mouse updates to every 100ms
    let lastUpdate = 0
    const throttledMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastUpdate > 100) {
        handleMouseMove(e)
        lastUpdate = now
      }
    }

    window.addEventListener("mousemove", throttledMouseMove)
    return () => {
      window.removeEventListener("mousemove", throttledMouseMove)
      cleanup()
    }
  }, [handleMouseMove, cleanup])

  const handleApplyTemplate = (template: Template, allSlides: boolean) => {
    if (allSlides) {
      applyTemplateToAll(template)
    } else if (selectedSlideId) {
      applyTemplateToSlide(selectedSlideId, template)
    }
  }

  const handleGeneratePresentation = (aiSlides: any[]) => {
    const formattedSlides = aiSlides.map((slide, index) => ({
      ...slide,
      id: String(Date.now() + index),
      backgroundColor: slide.backgroundColor || "#08080d",
      textColor: slide.textColor || "#faf8f5",
    }))
    replaceAllSlides(formattedSlides)
  }

  // Initialize first slide selection if needed
  useEffect(() => {
    if (!selectedSlideId && presentation.slides.length > 0) {
      setSelectedSlideId(presentation.slides[0].id)
    }
  }, [selectedSlideId, presentation.slides, setSelectedSlideId])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Multi-cursor overlay */}
      <MultiCursor collaborators={collaborators} />

      <EditorTopbar
        presentationTitle={presentation.title}
        onAIAssist={() => {
          // AI Assist functionality - can be expanded later
          console.log("AI Assist clicked")
        }}
      >
        {/* Collaborators panel in topbar */}
        <CollaboratorsPanel
          collaborators={collaborators}
          currentUserEmail={currentUser?.email || ""}
          isConnected={isConnected}
        />
      </EditorTopbar>

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Left Panel: Slides List */}
        <div className="w-64 bg-card rounded-lg border border-border overflow-auto">
          <SlidesPanel
            slides={presentation.slides}
            selectedId={selectedSlideId}
            onSelect={setSelectedSlideId}
            onAdd={addSlide}
            onDelete={deleteSlide}
            onDuplicate={duplicateSlide}
          />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 bg-card rounded-lg border border-border p-8 overflow-auto">
          {selectedSlide && (
            <SlideCanvas
              slide={selectedSlide}
              onUpdate={(updates) => updateSlide(selectedSlideId, updates)}
            />
          )}
        </div>

        {/* Right Panel: Properties */}
        <div className="w-80 bg-card rounded-lg border border-border overflow-auto">
          {selectedSlide && (
            <PropertiesPanel
              slide={selectedSlide}
              allSlides={presentation.slides}
              onUpdate={(updates) => updateSlide(selectedSlideId, updates)}
              onApplyTemplate={handleApplyTemplate}
              onGeneratePresentation={handleGeneratePresentation}
            />
          )}
        </div>
      </div>
    </div>
  )
}
