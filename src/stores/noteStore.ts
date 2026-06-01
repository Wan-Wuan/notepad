import { create } from 'zustand'
import { Note, Folder, AppSettings } from '../types'

interface NoteState {
  notes: Note[]
  folders: Folder[]
  currentNote: Note | null
  currentFolderId: string | null
  searchQuery: string
  isLoading: boolean

  // 笔记操作
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  deleteNote: (noteId: string) => void
  setCurrentNote: (note: Note | null) => void

  // 文件夹操作
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  updateFolder: (folder: Folder) => void
  deleteFolder: (folderId: string) => void
  setCurrentFolderId: (folderId: string | null) => void

  // 搜索
  setSearchQuery: (query: string) => void

  // 加载状态
  setIsLoading: (loading: boolean) => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  folders: [],
  currentNote: null,
  currentFolderId: null,
  searchQuery: '',
  isLoading: false,

  // 笔记操作
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (note) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? note : n)),
      currentNote: state.currentNote?.id === note.id ? note : state.currentNote
    })),
  deleteNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId),
      currentNote: state.currentNote?.id === noteId ? null : state.currentNote
    })),
  setCurrentNote: (note) => set({ currentNote: note }),

  // 文件夹操作
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  updateFolder: (folder) =>
    set((state) => ({
      folders: state.folders.map((f) => (f.id === folder.id ? folder : f))
    })),
  deleteFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
      currentFolderId: state.currentFolderId === folderId ? null : state.currentFolderId
    })),
  setCurrentFolderId: (folderId) => set({ currentFolderId: folderId }),

  // 搜索
  setSearchQuery: (query) => set({ searchQuery: query }),

  // 加载状态
  setIsLoading: (loading) => set({ isLoading: loading })
}))
