import { contextBridge, ipcRenderer } from 'electron'

// 暴露API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 笔记操作
  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),

  // 文件夹操作
  getFolders: () => ipcRenderer.invoke('get-folders'),
  saveFolders: (folders) => ipcRenderer.invoke('save-folders', folders),

  // 设置操作
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // 搜索操作
  searchNotes: (query) => ipcRenderer.invoke('search-notes', query),

  // 文件操作
  importFile: () => ipcRenderer.invoke('import-file'),
  exportFile: (data) => ipcRenderer.invoke('export-file', data),

  // 其他操作
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppInfo: () => ipcRenderer.invoke('get-app-info')
})
