import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store'

/**
 * Custom hook for auto-saving presentation changes
 * Triggers save after a debounce delay when slides change
 */
export function useAutoSave(delay: number = 2000) {
  const presentation = useEditorStore((state) => state.presentation)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<Date>(new Date())

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      // The presentation is already persisted to localStorage by zustand
      // This hook is mainly for triggering side effects or showing save status
      lastSavedRef.current = new Date()

      // You can add additional save logic here if needed
      // For example, syncing to a backend API
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [presentation, delay])

  return {
    lastSaved: lastSavedRef.current,
    isSaving: !!timeoutRef.current,
  }
}
