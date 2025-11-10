import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Slide, Presentation } from './types'
import type { Template } from './templates'

interface HistoryState {
  slides: Slide[]
  selectedSlideId: string
}

interface EditorState {
  // Presentation data
  presentation: Presentation
  selectedSlideId: string

  // History for undo/redo
  history: HistoryState[]
  historyIndex: number
  maxHistorySize: number

  // Actions
  setPresentation: (presentation: Presentation) => void
  setSelectedSlideId: (id: string) => void

  // Slide CRUD operations
  addSlide: (index?: number) => void
  duplicateSlide: (id: string) => void
  deleteSlide: (id: string) => void
  updateSlide: (id: string, updates: Partial<Slide>) => void
  reorderSlides: (startIndex: number, endIndex: number) => void

  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Bulk operations
  applyTemplateToSlide: (slideId: string, template: Template) => void
  applyTemplateToAll: (template: Template) => void
  replaceAllSlides: (slides: Slide[]) => void

  // Utility
  resetPresentation: () => void
  saveToHistory: () => void
}

const defaultSlides: Slide[] = [
  {
    id: '1',
    title: 'Title Slide',
    subtitle: 'Your Presentation Starts Here',
    content: '',
    layout: 'title',
    backgroundColor: '#08080d',
    textColor: '#faf8f5',
    isBranching: false,
    choices: [],
  },
  {
    id: '2',
    title: 'Content Slide',
    content: 'Add your content here',
    layout: 'content',
    backgroundColor: '#08080d',
    textColor: '#faf8f5',
    isBranching: false,
    choices: [],
  },
]

const defaultPresentation: Presentation = {
  id: 'default',
  title: 'Untitled Presentation',
  slides: defaultSlides,
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
  presentation: defaultPresentation,
  selectedSlideId: '1',
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  setPresentation: (presentation) => {
    set({ presentation, selectedSlideId: presentation.slides[0]?.id || '' })
    get().saveToHistory()
  },

  setSelectedSlideId: (id) => {
    set({ selectedSlideId: id })
  },

  saveToHistory: () => {
    const { presentation, selectedSlideId, history, historyIndex, maxHistorySize } = get()

    const newHistoryState: HistoryState = {
      slides: JSON.parse(JSON.stringify(presentation.slides)),
      selectedSlideId,
    }

    // Remove any history after current index
    const newHistory = history.slice(0, historyIndex + 1)

    // Add new state
    newHistory.push(newHistoryState)

    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift()
      set({ history: newHistory, historyIndex: newHistory.length - 1 })
    } else {
      set({ history: newHistory, historyIndex: newHistory.length - 1 })
    }
  },

  addSlide: (index) => {
    const { presentation, saveToHistory } = get()
    const newId = String(Date.now())
    const newSlide: Slide = {
      id: newId,
      title: 'New Slide',
      content: '',
      layout: 'content',
      backgroundColor: '#08080d',
      textColor: '#faf8f5',
      isBranching: false,
      choices: [],
    }

    const insertIndex = index !== undefined ? index : presentation.slides.length
    const newSlides = [...presentation.slides]
    newSlides.splice(insertIndex, 0, newSlide)

    set({
      presentation: { ...presentation, slides: newSlides },
      selectedSlideId: newId,
    })
    saveToHistory()
  },

  duplicateSlide: (id) => {
    const { presentation, saveToHistory } = get()
    const slideIndex = presentation.slides.findIndex((s) => s.id === id)
    if (slideIndex === -1) return

    const slideToDuplicate = presentation.slides[slideIndex]
    const newId = String(Date.now())
    const duplicatedSlide: Slide = {
      ...JSON.parse(JSON.stringify(slideToDuplicate)),
      id: newId,
      title: `${slideToDuplicate.title} (Copy)`,
    }

    const newSlides = [...presentation.slides]
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide)

    set({
      presentation: { ...presentation, slides: newSlides },
      selectedSlideId: newId,
    })
    saveToHistory()
  },

  deleteSlide: (id) => {
    const { presentation, selectedSlideId, saveToHistory } = get()
    if (presentation.slides.length <= 1) return

    const newSlides = presentation.slides.filter((s) => s.id !== id)
    const newSelectedId = selectedSlideId === id ? newSlides[0].id : selectedSlideId

    set({
      presentation: { ...presentation, slides: newSlides },
      selectedSlideId: newSelectedId,
    })
    saveToHistory()
  },

  updateSlide: (id, updates) => {
    const { presentation, saveToHistory } = get()
    const newSlides = presentation.slides.map((slide) =>
      slide.id === id ? { ...slide, ...updates } : slide
    )

    set({
      presentation: { ...presentation, slides: newSlides },
    })
    saveToHistory()
  },

  reorderSlides: (startIndex, endIndex) => {
    const { presentation, saveToHistory } = get()
    const newSlides = [...presentation.slides]
    const [removed] = newSlides.splice(startIndex, 1)
    newSlides.splice(endIndex, 0, removed)

    set({
      presentation: { ...presentation, slides: newSlides },
    })
    saveToHistory()
  },

  undo: () => {
    const { history, historyIndex, presentation } = get()
    if (historyIndex <= 0) return

    const newIndex = historyIndex - 1
    const previousState = history[newIndex]

    set({
      presentation: { ...presentation, slides: JSON.parse(JSON.stringify(previousState.slides)) },
      selectedSlideId: previousState.selectedSlideId,
      historyIndex: newIndex,
    })
  },

  redo: () => {
    const { history, historyIndex, presentation } = get()
    if (historyIndex >= history.length - 1) return

    const newIndex = historyIndex + 1
    const nextState = history[newIndex]

    set({
      presentation: { ...presentation, slides: JSON.parse(JSON.stringify(nextState.slides)) },
      selectedSlideId: nextState.selectedSlideId,
      historyIndex: newIndex,
    })
  },

  canUndo: () => {
    const { historyIndex } = get()
    return historyIndex > 0
  },

  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },

  applyTemplateToSlide: (slideId, template) => {
    const { updateSlide } = get()
    updateSlide(slideId, {
      backgroundColor: template.styles.backgroundColor,
      textColor: template.styles.textColor,
    })
  },

  applyTemplateToAll: (template) => {
    const { presentation, saveToHistory } = get()
    const newSlides = presentation.slides.map((slide) => ({
      ...slide,
      backgroundColor: template.styles.backgroundColor,
      textColor: template.styles.textColor,
    }))

    set({
      presentation: { ...presentation, slides: newSlides },
    })
    saveToHistory()
  },

  replaceAllSlides: (slides) => {
    const { presentation, saveToHistory } = get()
    set({
      presentation: { ...presentation, slides },
      selectedSlideId: slides[0]?.id || '',
    })
    saveToHistory()
  },

  resetPresentation: () => {
    set({
      presentation: JSON.parse(JSON.stringify(defaultPresentation)),
      selectedSlideId: '1',
      history: [],
      historyIndex: -1,
    })
  },
}),
    {
      name: 'powerpoint-editor-storage',
      partialize: (state) => ({
        presentation: state.presentation,
        selectedSlideId: state.selectedSlideId,
        history: state.history,
        historyIndex: state.historyIndex,
      }),
    }
  )
)
