import { useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useNoteStore } from '../stores/noteStore'
import { createNote } from '../utils/fileUtils'

export const useKeyboardShortcuts = () => {
  const { toggleSearch, toggleSettings, toggleSidebar, toggleNoteList } = useAppStore()
  const { currentFolderId, addNote, setCurrentNote } = useNoteStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey

    // Ctrl/Cmd + K: 打开搜索
    if (isCtrl && e.key === 'k') {
      e.preventDefault()
      toggleSearch()
    }

    // Ctrl/Cmd + ,: 打开设置
    if (isCtrl && e.key === ',') {
      e.preventDefault()
      toggleSettings()
    }

    // Ctrl/Cmd + B: 切换侧边栏
    if (isCtrl && e.key === 'b' && !e.shiftKey) {
      e.preventDefault()
      toggleSidebar()
    }

    // Ctrl/Cmd + Shift + L: 切换笔记列表
    if (isCtrl && e.shiftKey && e.key === 'L') {
      e.preventDefault()
      toggleNoteList()
    }

    // Ctrl/Cmd + N: 新建笔记
    if (isCtrl && e.key === 'n') {
      e.preventDefault()
      const newNote = createNote(currentFolderId)
      addNote(newNote)
      setCurrentNote(newNote)
    }
  }, [toggleSearch, toggleSettings, toggleSidebar, toggleNoteList, currentFolderId, addNote, setCurrentNote])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
