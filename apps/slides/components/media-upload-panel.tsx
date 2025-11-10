"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, type File, FileIcon, ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MediaUploadPanelProps {
  onImageUpload: (imageUrl: string, position: string) => void
  onAttachmentUpload: (file: { name: string; url: string; type: "image" | "pdf" | "file" }) => void
  currentImage?: string
  attachments?: Array<{ id: string; name: string; url: string; type: "image" | "pdf" | "file" }>
  onRemoveAttachment?: (id: string) => void
  onRemoveImage?: () => void
}

export default function MediaUploadPanel({
  onImageUpload,
  onAttachmentUpload,
  currentImage,
  attachments = [],
  onRemoveAttachment,
  onRemoveImage,
}: MediaUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [imagePosition, setImagePosition] = useState("full")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        const isImage = file.type.startsWith("image/")
        const type = isImage ? "image" : file.type === "application/pdf" ? "pdf" : "file"

        if (isImage) {
          onImageUpload(url, imagePosition)
        } else {
          onAttachmentUpload({
            name: file.name,
            url,
            type,
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Media & Attachments</h3>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Image Position</label>
        <Select value={imagePosition} onValueChange={setImagePosition}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Screen</SelectItem>
            <SelectItem value="left">Left Side</SelectItem>
            <SelectItem value="right">Right Side</SelectItem>
            <SelectItem value="background">Background</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className="cursor-pointer block">
          <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Drag files here or click</p>
        </label>
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Current Image</p>
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <img src={currentImage || "/placeholder.svg"} alt="Slide" className="w-full h-24 object-cover" />
            {onRemoveImage && (
              <button onClick={onRemoveImage} className="absolute top-2 right-2 bg-destructive text-white p-1 rounded">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Attachments ({attachments.length})</p>
          <div className="space-y-1">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between bg-card/50 p-2 rounded text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {attachment.type === "image" ? (
                    <ImageIcon className="h-3 w-3 text-accent flex-shrink-0" />
                  ) : (
                    <FileIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="truncate text-muted-foreground">{attachment.name}</span>
                </div>
                {onRemoveAttachment && (
                  <button
                    onClick={() => onRemoveAttachment(attachment.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
