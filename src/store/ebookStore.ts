import { Store } from '@tanstack/store'

// Types
export interface Chapter {
  id: string
  title: string
  content: string
  order: number
}

export interface EbookMetadata {
  title: string
  author: string
  description: string
  coverImage?: string
}

export interface Ebook {
  id: string
  metadata: EbookMetadata
  chapters: Chapter[]
  createdAt: number
  updatedAt: number
}

export interface EbookState {
  currentEbook: Ebook | null
  savedEbooks: Ebook[]
  isEditing: boolean
}

const initialState: EbookState = {
  currentEbook: null,
  savedEbooks: [],
  isEditing: false,
}

export const ebookStore = new Store<EbookState>(initialState)

// Selectors
export const ebookSelectors = {
  getCurrentEbook: (state: EbookState) => state.currentEbook,
  getSavedEbooks: (state: EbookState) => state.savedEbooks,
  isEditing: (state: EbookState) => state.isEditing,
  getChapterById: (state: EbookState, chapterId: string) => {
    return state.currentEbook?.chapters.find(ch => ch.id === chapterId) || null
  },
}

// Actions
export const ebookActions = {
  createNewEbook: (metadata: EbookMetadata) => {
    const newEbook: Ebook = {
      id: Date.now().toString(),
      metadata,
      chapters: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    ebookStore.setState(state => ({
      ...state,
      currentEbook: newEbook,
      isEditing: true,
    }))
  },

  loadEbook: (ebook: Ebook) => {
    ebookStore.setState(state => ({
      ...state,
      currentEbook: ebook,
      isEditing: true,
    }))
  },

  updateMetadata: (metadata: Partial<EbookMetadata>) => {
    ebookStore.setState(state => {
      if (!state.currentEbook) return state
      return {
        ...state,
        currentEbook: {
          ...state.currentEbook,
          metadata: { ...state.currentEbook.metadata, ...metadata },
          updatedAt: Date.now(),
        },
      }
    })
  },

  addChapter: (title: string) => {
    ebookStore.setState(state => {
      if (!state.currentEbook) return state
      const newChapter: Chapter = {
        id: Date.now().toString(),
        title,
        content: '',
        order: state.currentEbook.chapters.length,
      }
      return {
        ...state,
        currentEbook: {
          ...state.currentEbook,
          chapters: [...state.currentEbook.chapters, newChapter],
          updatedAt: Date.now(),
        },
      }
    })
  },

  updateChapter: (chapterId: string, updates: Partial<Chapter>) => {
    ebookStore.setState(state => {
      if (!state.currentEbook) return state
      return {
        ...state,
        currentEbook: {
          ...state.currentEbook,
          chapters: state.currentEbook.chapters.map(ch =>
            ch.id === chapterId ? { ...ch, ...updates } : ch
          ),
          updatedAt: Date.now(),
        },
      }
    })
  },

  deleteChapter: (chapterId: string) => {
    ebookStore.setState(state => {
      if (!state.currentEbook) return state
      const updatedChapters = state.currentEbook.chapters
        .filter(ch => ch.id !== chapterId)
        .map((ch, index) => ({ ...ch, order: index }))
      return {
        ...state,
        currentEbook: {
          ...state.currentEbook,
          chapters: updatedChapters,
          updatedAt: Date.now(),
        },
      }
    })
  },

  reorderChapters: (chapters: Chapter[]) => {
    ebookStore.setState(state => {
      if (!state.currentEbook) return state
      return {
        ...state,
        currentEbook: {
          ...state.currentEbook,
          chapters: chapters.map((ch, index) => ({ ...ch, order: index })),
          updatedAt: Date.now(),
        },
      }
    })
  },

  saveEbook: () => {
    ebookStore.setState(state => {
      if (!state.currentEbook) return state
      const existingIndex = state.savedEbooks.findIndex(
        eb => eb.id === state.currentEbook!.id
      )
      let updatedSavedEbooks
      if (existingIndex >= 0) {
        updatedSavedEbooks = state.savedEbooks.map((eb, idx) =>
          idx === existingIndex ? state.currentEbook! : eb
        )
      } else {
        updatedSavedEbooks = [...state.savedEbooks, state.currentEbook]
      }
      return {
        ...state,
        savedEbooks: updatedSavedEbooks,
      }
    })
  },

  closeEbook: () => {
    ebookStore.setState(state => ({
      ...state,
      currentEbook: null,
      isEditing: false,
    }))
  },

  deleteEbook: (ebookId: string) => {
    ebookStore.setState(state => ({
      ...state,
      savedEbooks: state.savedEbooks.filter(eb => eb.id !== ebookId),
      currentEbook:
        state.currentEbook?.id === ebookId ? null : state.currentEbook,
    }))
  },
}
