"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Loader,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Download
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OllamaAIAssistantProps {
  onSlideGenerated: (slide: {
    title: string
    content: string
    layout?: string
    image?: { url: string; position?: string }
  }) => void
}

export default function OllamaAIAssistant({ onSlideGenerated }: OllamaAIAssistantProps) {
  const [topic, setTopic] = useState("")
  const [context, setContext] = useState("")
  const [provider, setProvider] = useState<"ollama" | "openai">("ollama")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("generate")

  // Image search state
  const [imageQuery, setImageQuery] = useState("")
  const [images, setImages] = useState<any[]>([])
  const [isSearchingImages, setIsSearchingImages] = useState(false)
  const [selectedImage, setSelectedImage] = useState<any | null>(null)

  const handleGenerateSlide = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic")
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/ai/generate-slide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          context,
          provider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate slide')
      }

      if (data.success) {
        // Generate slide with AI content
        const slideData: any = {
          title: data.data.title,
          content: data.data.content,
          layout: data.data.layout || "content",
        }

        // Add selected image if available
        if (selectedImage) {
          slideData.image = {
            url: selectedImage.url,
            position: "right",
          }
        }

        onSlideGenerated(slideData)
        setSuccess("Slide generated successfully!")
        setTopic("")
        setContext("")
        setSelectedImage(null)

        // Auto-clear success message
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      console.error("Error generating slide:", err)
      setError(err.message || "Failed to generate slide. Make sure Ollama is running.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSearchImages = async () => {
    if (!imageQuery.trim()) return

    setIsSearchingImages(true)
    try {
      const response = await fetch('/api/ai/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: imageQuery,
          perPage: 9,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setImages(data.images)
      }
    } catch (err) {
      console.error("Error searching images:", err)
      setError("Failed to search images")
    } finally {
      setIsSearchingImages(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Assistant</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Slide</TabsTrigger>
          <TabsTrigger value="images">Find Images</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">
                  Ollama (Local)
                </SelectItem>
                <SelectItem value="openai">
                  OpenAI (Cloud)
                </SelectItem>
              </SelectContent>
            </Select>
            {provider === "ollama" && (
              <p className="text-xs text-muted-foreground">
                Requires Ollama running on localhost:11434
              </p>
            )}
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Market Analysis 2024"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Context Input */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="Add any specific details or requirements..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isGenerating}
              rows={3}
            />
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="p-2 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Selected Image:</p>
              <img
                src={selectedImage.thumbnail}
                alt={selectedImage.description}
                className="w-full h-24 object-cover rounded"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="w-full mt-2"
              >
                Remove Image
              </Button>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateSlide}
            disabled={!topic.trim() || isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Slide
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="images" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="image-search">Search Images</Label>
            <div className="flex gap-2">
              <Input
                id="image-search"
                placeholder="e.g., business charts"
                value={imageQuery}
                onChange={(e) => setImageQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchImages()}
                disabled={isSearchingImages}
              />
              <Button
                onClick={handleSearchImages}
                disabled={!imageQuery.trim() || isSearchingImages}
                size="sm"
              >
                {isSearchingImages ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage?.id === image.id
                      ? "border-primary ring-2 ring-primary"
                      : "border-transparent hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.description}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage?.id === image.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedImage && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Image selected! Generate a slide to use it.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Ollama Instructions */}
      {provider === "ollama" && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs space-y-2">
          <p className="font-semibold">Ollama Setup Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Install Ollama: <code>curl https://ollama.ai/install.sh | sh</code></li>
            <li>Pull a model: <code>ollama pull llama3.2</code></li>
            <li>Start Ollama: <code>ollama serve</code></li>
          </ol>
        </div>
      )}
    </div>
  )
}
