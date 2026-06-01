import { create } from 'zustand'
import { AppSettings, ViewMode, SortBy, SortOrder } from '../types'

interface AppState {
  settings: AppSettings
  viewMode: ViewMode
  sortBy: SortBy
  sortOrder: SortOrder
  isSidebarOpen: boolean
  isNoteListOpen: boolean
  isSettingsOpen: boolean
  isSearchOpen: boolean

  // 设置操作
  setSettings: (settings: AppSettings) => void
  updateSettings: (partial: Partial<AppSettings>) => void

  // 视图操作
  setViewMode: (mode: ViewMode) => void
  setSortBy: (sort: SortBy) => void
  setSortOrder: (order: SortOrder) => void

  // 面板操作
  toggleSidebar: () => void
  toggleNoteList: () => void
  toggleSettings: () => void
  toggleSearch: () => void
  setIsSidebarOpen: (open: boolean) => void
  setIsNoteListOpen: (open: boolean) => void
  setIsSettingsOpen: (open: boolean) => void
  setIsSearchOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    theme: 'light',
    fontSize: 16,
    fontFamily: 'system-ui',
    autoSave: true,
    autoSaveInterval: 30000,
    showLineNumbers: false,
    defaultNoteFormat: 'markdown',
    storagePath: ''
  },
  viewMode: 'list',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  isSidebarOpen: true,
  isNoteListOpen: true,
  isSettingsOpen: false,
  isSearchOpen: false,

  // 设置操作
  setSettings: (settings) => set({ settings }),
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial }
    })),

  // 视图操作
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),

  // 面板操作
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleNoteList: () => set((state) => ({ isNoteListOpen: !state.isNoteListOpen })),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setIsNoteListOpen: (open) => set({ isNoteListOpen: open }),
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open })
}))
