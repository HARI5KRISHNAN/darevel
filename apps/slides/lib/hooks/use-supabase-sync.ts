"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useEditorStore } from "@/lib/store"
import type { Presentation } from "@/lib/types"

/**
 * Hook to automatically sync presentation changes to Supabase
 * Debounces updates to avoid excessive database writes
 */
export function useSupabaseSync() {
  const supabase = createClient()
  const { presentation } = useEditorStore()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSyncedRef = useRef<string>("")

  useEffect(() => {
    const syncToSupabase = async (pres: Presentation) => {
      try {
        // Skip if no user is logged in
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Skip if presentation hasn't changed
        const presString = JSON.stringify(pres)
        if (presString === lastSyncedRef.current) return

        // Update presentation in Supabase
        const { error } = await supabase
          .from("presentations")
          .update({
            title: pres.title,
            slides: pres.slides,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pres.id)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error syncing to Supabase:", error)
          return
        }

        lastSyncedRef.current = presString
        console.log("✓ Synced to Supabase")
      } catch (error) {
        console.error("Error in Supabase sync:", error)
      }
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce sync - wait 2 seconds after last change
    timeoutRef.current = setTimeout(() => {
      syncToSupabase(presentation)
    }, 2000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [presentation, supabase])

  return {
    // Could expose sync status here if needed
  }
}
