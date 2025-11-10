"use client"

import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/store'
import { useAutoSave } from '@/lib/hooks/use-auto-save'
import Link from 'next/link'
import {
  Undo2,
  Redo2,
  Plus,
  Eye,
  Download,
  Save,
  Sparkles,
  Share2,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorTopbarProps {
  onAIAssist?: () => void
  onPreview?: () => void
  presentationTitle?: string
  children?: React.ReactNode
}

export default function EditorTopbar({
  onAIAssist,
  onPreview,
  presentationTitle = "Untitled Presentation",
  children
}: EditorTopbarProps) {
  const {
    addSlide,
    undo,
    redo,
    canUndo,
    canRedo,
    presentation
  } = useEditorStore()

  const { lastSaved } = useAutoSave()

  const handleDownload = () => {
    // Export presentation as JSON
    const dataStr = JSON.stringify(presentation, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${presentation.title || 'presentation'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    // The presentation is auto-saved via localStorage
    // This button is mainly for user feedback
    alert('Presentation saved to browser storage!')
  }

  const formatLastSaved = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return lastSaved.toLocaleDateString()
  }

  return (
    <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section: Back Button & Title */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{presentationTitle}</h1>
            <p className="text-xs text-muted-foreground">
              Last saved {formatLastSaved()}
            </p>
          </div>
        </div>

        {/* Middle Section: Editor Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => addSlide()}
            variant="outline"
            size="sm"
            className="gap-2"
            title="Add New Slide (Ctrl/Cmd + M)"
          >
            <Plus className="h-4 w-4" />
            Add Slide
          </Button>

          <div className="flex items-center gap-1 border-l pl-2 ml-2">
            <Button
              onClick={undo}
              disabled={!canUndo()}
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                !canUndo() && "opacity-50 cursor-not-allowed"
              )}
              title="Undo (Ctrl/Cmd + Z)"
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </Button>

            <Button
              onClick={redo}
              disabled={!canRedo()}
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                !canRedo() && "opacity-50 cursor-not-allowed"
              )}
              title="Redo (Ctrl/Cmd + Shift + Z)"
            >
              <Redo2 className="h-4 w-4" />
              Redo
            </Button>
          </div>
        </div>

        {/* Right Section: Preview & Export Actions */}
        <div className="flex items-center gap-3">
          {/* Collaboration Panel */}
          {children}

          {onAIAssist && (
            <Button
              onClick={onAIAssist}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              AI Assist
            </Button>
          )}

          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            title="Save to localStorage"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            title="Download as JSON"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>

          {onPreview ? (
            <Button
              onClick={onPreview}
              size="sm"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          ) : (
            <Link href="/viewer">
              <Button size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                View
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="px-6 pb-2 text-xs text-muted-foreground hidden md:block">
        <span className="mr-4">💡 Keyboard shortcuts:</span>
        <span className="mr-3">Ctrl+Z (Undo)</span>
        <span className="mr-3">Ctrl+Shift+Z (Redo)</span>
        <span className="mr-3">Ctrl+M (New Slide)</span>
      </div>
    </div>
  )
}
