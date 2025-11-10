"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Presentation, Loader2, LogOut, FileText, Trash2, Users } from "lucide-react"
import Link from "next/link"
import type { PresentationRow } from "@/lib/supabase/types"
import type { Presentation as PresentationType } from "@/lib/types"
import { useEditorStore } from "@/lib/store"

export default function DashboardPage() {
  const [presentations, setPresentations] = useState<PresentationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()
  const { setPresentation } = useEditorStore()

  useEffect(() => {
    loadUserAndPresentations()
  }, [])

  const loadUserAndPresentations = async () => {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUserEmail(user.email || "")

      // Load presentations
      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .order("updated_at", { ascending: false })

      if (error) throw error
      setPresentations(data || [])
    } catch (error) {
      console.error("Error loading presentations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPresentation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newPresentation: PresentationType = {
        id: crypto.randomUUID(),
        title: "Untitled Presentation",
        slides: [
          {
            id: "1",
            title: "Welcome",
            subtitle: "Your presentation starts here",
            layout: "title",
            backgroundColor: "#1e293b",
            textColor: "#ffffff",
          },
        ],
      }

      const { data, error } = await supabase
        .from("presentations")
        .insert({
          user_id: user.id,
          title: newPresentation.title,
          slides: newPresentation.slides,
        })
        .select()
        .single()

      if (error) throw error

      // Load into editor store
      setPresentation({
        ...newPresentation,
        id: data.id,
      })

      router.push("/editor")
    } catch (error) {
      console.error("Error creating presentation:", error)
    }
  }

  const handleOpenPresentation = async (presentation: PresentationRow) => {
    // Load into editor store
    setPresentation({
      id: presentation.id,
      title: presentation.title,
      slides: presentation.slides,
    })

    router.push("/editor")
  }

  const handleDeletePresentation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this presentation?")) return

    try {
      const { error } = await supabase
        .from("presentations")
        .delete()
        .eq("id", id)

      if (error) throw error

      setPresentations(presentations.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting presentation:", error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Presentation className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PowerPoint</h1>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">My Presentations</h2>
          <p className="text-muted-foreground">Create and manage your presentations</p>
        </div>

        {/* Presentations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New Presentation Card */}
          <Card
            className="group cursor-pointer hover:shadow-lg transition-all border-2 border-dashed hover:border-primary"
            onClick={handleNewPresentation}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">New Presentation</h3>
              <p className="text-xs text-muted-foreground text-center">
                Start with a blank presentation
              </p>
            </CardContent>
          </Card>

          {/* Existing Presentations */}
          {presentations.map((presentation) => (
            <Card
              key={presentation.id}
              className="group cursor-pointer hover:shadow-lg transition-all relative"
              onClick={() => handleOpenPresentation(presentation)}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-t-lg">
                  <div className="text-center p-4">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300">
                      {presentation.slides.length} slide{presentation.slides.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {presentation.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Updated {new Date(presentation.updated_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {presentation.is_public && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Users className="h-3 w-3" />
                        <span>Shared</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeletePresentation(presentation.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {presentations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Presentation className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No presentations yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first presentation to get started
            </p>
            <Button onClick={handleNewPresentation} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Presentation
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
