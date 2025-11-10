"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { CollaborationSessionRow } from "@/lib/supabase/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Generate a random color for the user's cursor
const CURSOR_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Orange
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B88B", // Peach
  "#AAB7B8", // Gray
]

function getRandomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]
}

export interface CursorPosition {
  x: number
  y: number
  slideIndex?: number
}

export interface Collaborator {
  id: string
  user_id: string
  user_email: string | null
  user_name: string | null
  cursor_position: CursorPosition
  current_slide_index: number
  color: string
  last_active: string
}

interface UseCollaborationOptions {
  presentationId: string
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void
}

export function useCollaboration({ presentationId, onCollaboratorsChange }: UseCollaborationOptions) {
  const supabase = createClient()
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const userColorRef = useRef<string>(getRandomColor())

  // Initialize presence and set up real-time subscription
  useEffect(() => {
    if (!presentationId) return

    let mounted = true

    const initCollaboration = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        setCurrentUser({ id: user.id, email: user.email || "Anonymous" })

        // Create or update collaboration session
        const { data: session, error: sessionError } = await supabase
          .from("collaboration_sessions")
          .upsert({
            presentation_id: presentationId,
            user_id: user.id,
            user_email: user.email,
            user_name: user.email?.split("@")[0] || "User",
            color: userColorRef.current,
            cursor_position: { x: 0, y: 0 },
            current_slide_index: 0,
            last_active: new Date().toISOString(),
          })
          .select()
          .single()

        if (sessionError && sessionError.code !== '23505') { // Ignore duplicate key errors
          console.error("Error creating collaboration session:", sessionError)
          return
        }

        if (session) {
          sessionIdRef.current = session.id
        }

        // Set up real-time channel
        const channel = supabase.channel(`presentation:${presentationId}`)

        // Subscribe to collaboration session changes
        channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "collaboration_sessions",
              filter: `presentation_id=eq.${presentationId}`,
            },
            (payload) => {
              if (!mounted) return
              loadCollaborators()
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setIsConnected(true)
              loadCollaborators()
            }
          })

        channelRef.current = channel

        // Initial load of collaborators
        loadCollaborators()

        // Set up heartbeat to update last_active
        const heartbeatInterval = setInterval(() => {
          updateLastActive()
        }, 30000) // Every 30 seconds

        return () => {
          clearInterval(heartbeatInterval)
        }
      } catch (error) {
        console.error("Error initializing collaboration:", error)
      }
    }

    initCollaboration()

    return () => {
      mounted = false
      cleanup()
    }
  }, [presentationId])

  // Load all active collaborators
  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from("collaboration_sessions")
        .select("*")
        .eq("presentation_id", presentationId)
        .gte("last_active", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes

      if (error) throw error

      const collaboratorList = (data || []).map((session) => ({
        id: session.id,
        user_id: session.user_id,
        user_email: session.user_email,
        user_name: session.user_name,
        cursor_position: session.cursor_position as CursorPosition,
        current_slide_index: session.current_slide_index,
        color: session.color,
        last_active: session.last_active,
      }))

      setCollaborators(collaboratorList)
      onCollaboratorsChange?.(collaboratorList)
    } catch (error) {
      console.error("Error loading collaborators:", error)
    }
  }

  // Update cursor position
  const updateCursorPosition = async (position: CursorPosition) => {
    if (!sessionIdRef.current || !currentUser) return

    try {
      await supabase
        .from("collaboration_sessions")
        .update({
          cursor_position: position,
          last_active: new Date().toISOString(),
        })
        .eq("id", sessionIdRef.current)
    } catch (error) {
      console.error("Error updating cursor position:", error)
    }
  }

  // Update current slide index
  const updateCurrentSlide = async (slideIndex: number) => {
    if (!sessionIdRef.current || !currentUser) return

    try {
      await supabase
        .from("collaboration_sessions")
        .update({
          current_slide_index: slideIndex,
          last_active: new Date().toISOString(),
        })
        .eq("id", sessionIdRef.current)
    } catch (error) {
      console.error("Error updating current slide:", error)
    }
  }

  // Update last active timestamp
  const updateLastActive = async () => {
    if (!sessionIdRef.current) return

    try {
      await supabase
        .from("collaboration_sessions")
        .update({
          last_active: new Date().toISOString(),
        })
        .eq("id", sessionIdRef.current)
    } catch (error) {
      console.error("Error updating last active:", error)
    }
  }

  // Cleanup function
  const cleanup = async () => {
    // Unsubscribe from channel
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Remove collaboration session
    if (sessionIdRef.current) {
      try {
        await supabase
          .from("collaboration_sessions")
          .delete()
          .eq("id", sessionIdRef.current)
      } catch (error) {
        console.error("Error cleaning up collaboration session:", error)
      }
      sessionIdRef.current = null
    }

    setIsConnected(false)
  }

  return {
    collaborators: collaborators.filter((c) => c.user_id !== currentUser?.id), // Exclude current user
    currentUser,
    isConnected,
    userColor: userColorRef.current,
    updateCursorPosition,
    updateCurrentSlide,
    cleanup,
  }
}
