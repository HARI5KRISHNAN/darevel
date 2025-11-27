import { useEffect } from 'react'
import { useEditorStore } from '../store'

/**
 * Custom hook for handling keyboard shortcuts in the editor
 */
export function useKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo, addSlide, deleteSlide, selectedSlideId } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for modifier keys
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Undo: Ctrl/Cmd + Z
      if (modifier && e.key === 'z' && !e.shiftKey) {
        if (canUndo()) {
          e.preventDefault()
          undo()
        }
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((modifier && e.key === 'z' && e.shiftKey) || (modifier && e.key === 'y')) {
        if (canRedo()) {
          e.preventDefault()
          redo()
        }
      }

      // New Slide: Ctrl/Cmd + M
      if (modifier && e.key === 'm') {
        e.preventDefault()
        addSlide()
      }

      // Delete Slide: Delete/Backspace (when focused on editor, not in text field)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTextInputFocused()) {
        if (modifier) {
          e.preventDefault()
          deleteSlide(selectedSlideId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo, addSlide, deleteSlide, selectedSlideId])
}

/**
 * Helper to check if a text input is currently focused
 */
function isTextInputFocused(): boolean {
  const activeElement = document.activeElement
  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    (activeElement instanceof HTMLElement && activeElement.isContentEditable)
  )
}
