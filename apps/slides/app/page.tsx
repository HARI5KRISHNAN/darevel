"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-provider"
import { Sun, Moon, Plus, Sparkles, Clock } from "lucide-react"

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [presentations, setPresentations] = useState([
    { id: 1, title: "Q1 Marketing Strategy", slides: 12, lastEdited: "2 days ago" },
    { id: 2, title: "Product Launch Pitch", slides: 8, lastEdited: "1 week ago" },
    { id: 3, title: "Company Quarterly Review", slides: 15, lastEdited: "2 weeks ago" },
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold glow-text">Presen.AI</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => (window.location.href = "/login")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted"
              >
                Login
              </button>
              <button
                onClick={() => (window.location.href = "/signup")}
                className="rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg"
              >
                Sign Up
              </button>
              <button
                onClick={toggleTheme}
                className="rounded-lg border border-border p-2 transition-colors hover:bg-muted"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="glow-text">Reinvent Your Presentations</span>
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Say goodbye to boring slides. Describe your topic, and let our AI craft a unique and engaging visual story
            for you.
          </p>

          {/* AI Generation Input */}
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., 'The Future of Renewable Energy'"
                className="flex-1 rounded-full border border-border bg-input px-6 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3 font-semibold text-primary-foreground transition-all hover:shadow-lg hover:scale-105">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Dashboard</h3>
              <p className="text-muted-foreground">Welcome back! Manage your presentations.</p>
            </div>
            <button
              onClick={() => (window.location.href = "/editor")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Presentation
            </button>
          </div>

          {/* Recent Presentations */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-foreground">Recent Presentations</h4>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className="group cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-lg"
                >
                  <div className="relative mb-4 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30">
                    <span className="text-sm font-semibold text-primary">{presentation.slides} slides</span>
                  </div>
                  <h5 className="mb-2 font-semibold text-card-foreground">{presentation.title}</h5>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last edited {presentation.lastEdited}
                  </div>
                </div>
              ))}

              {/* Add New Presentation Card */}
              <div
                onClick={() => (window.location.href = "/editor")}
                className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-4 transition-all hover:border-primary hover:bg-card"
              >
                <div className="text-center">
                  <Plus className="mx-auto mb-2 h-8 w-8 text-muted-foreground group-hover:text-primary" />
                  <p className="text-sm font-semibold text-muted-foreground">Create New</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
