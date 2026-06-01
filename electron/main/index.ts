import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readdir, readFile, writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'

let mainWindow: BrowserWindow | null = null

// 笔记存储路径
const getStoragePath = () => {
  return join(app.getPath('userData'), 'notes')
}

// 确保存储目录存在
const ensureStoragePath = async () => {
  const storagePath = getStoragePath()
  if (!existsSync(storagePath)) {
    await mkdir(storagePath, { recursive: true })
  }
  const attachmentsPath = join(storagePath, 'attachments')
  if (!existsSync(attachmentsPath)) {
    await mkdir(attachmentsPath, { recursive: true })
  }
}

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false
  })

  // 窗口准备好后再显示，避免白屏闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 开发环境加载开发服务器
  if (process.env.ELECTRON_RENDERER_URL) {
    console.log('Loading renderer URL:', process.env.ELECTRON_RENDERER_URL)
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    const indexPath = join(__dirname, '../renderer/index.html')
    console.log('Loading file:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  // 页面加载完成事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully')
  })

  // 页面加载失败事件
  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('Page load failed:', errorCode, errorDescription)
  })
}

// 应用准备就绪
app.whenReady().then(async () => {
  await ensureStoragePath()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC处理：获取笔记列表
ipcMain.handle('get-notes', async () => {
  try {
    const storagePath = getStoragePath()
    const files = await readdir(storagePath)
    const notes = []

    for (const file of files) {
      // 只加载数字ID命名的笔记文件，排除 folders.json 和 settings.json
      if (file.endsWith('.json') && /^\d+\.json$/.test(file)) {
        const content = await readFile(join(storagePath, file), 'utf-8')
        notes.push(JSON.parse(content))
      }
    }

    return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch (error) {
    console.error('Error getting notes:', error)
    return []
  }
})

// IPC处理：保存笔记
ipcMain.handle('save-note', async (_, note) => {
  try {
    const storagePath = getStoragePath()
    const filePath = join(storagePath, `${note.id}.json`)
    await writeFile(filePath, JSON.stringify(note, null, 2))
    return note
  } catch (error) {
    console.error('Error saving note:', error)
    throw error
  }
})

// IPC处理：删除笔记
ipcMain.handle('delete-note', async (_, noteId) => {
  try {
    const storagePath = getStoragePath()
    const filePath = join(storagePath, `${noteId}.json`)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
})

// IPC处理：获取文件夹列表
ipcMain.handle('get-folders', async () => {
  try {
    const storagePath = getStoragePath()
    const foldersPath = join(storagePath, 'folders.json')

    if (!existsSync(foldersPath)) {
      await writeFile(foldersPath, JSON.stringify([], null, 2))
      return []
    }

    const content = await readFile(foldersPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error getting folders:', error)
    return []
  }
})

// IPC处理：保存文件夹列表
ipcMain.handle('save-folders', async (_, folders) => {
  try {
    const storagePath = getStoragePath()
    const foldersPath = join(storagePath, 'folders.json')
    await writeFile(foldersPath, JSON.stringify(folders, null, 2))
    return folders
  } catch (error) {
    console.error('Error saving folders:', error)
    throw error
  }
})

// IPC处理：获取设置
ipcMain.handle('get-settings', async () => {
  try {
    const storagePath = getStoragePath()
    const settingsPath = join(storagePath, 'settings.json')

    const defaultSettings = {
      theme: 'light',
      fontSize: 16,
      fontFamily: 'system-ui',
      autoSave: true,
      autoSaveInterval: 30000,
      showLineNumbers: false,
      defaultNoteFormat: 'markdown',
      storagePath: storagePath
    }

    if (!existsSync(settingsPath)) {
      await writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2))
      return defaultSettings
    }

    const content = await readFile(settingsPath, 'utf-8')
    return { ...defaultSettings, ...JSON.parse(content) }
  } catch (error) {
    console.error('Error getting settings:', error)
    return {
      theme: 'light',
      fontSize: 16,
      fontFamily: 'system-ui',
      autoSave: true,
      autoSaveInterval: 30000,
      showLineNumbers: false,
      defaultNoteFormat: 'markdown',
      storagePath: getStoragePath()
    }
  }
})

// IPC处理：保存设置
ipcMain.handle('save-settings', async (_, settings) => {
  try {
    const storagePath = getStoragePath()
    const settingsPath = join(storagePath, 'settings.json')
    await writeFile(settingsPath, JSON.stringify(settings, null, 2))
    return settings
  } catch (error) {
    console.error('Error saving settings:', error)
    throw error
  }
})

// IPC处理：搜索笔记
ipcMain.handle('search-notes', async (_, query) => {
  try {
    const storagePath = getStoragePath()
    const files = await readdir(storagePath)
    const results = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await readFile(join(storagePath, file), 'utf-8')
        const note = JSON.parse(content)

        const titleMatch = note.title.toLowerCase().includes(query.toLowerCase())
        const contentMatch = note.content.toLowerCase().includes(query.toLowerCase())

        if (titleMatch || contentMatch) {
          results.push({
            ...note,
            matchCount: (note.title.match(new RegExp(query, 'gi')) || []).length +
              (note.content.match(new RegExp(query, 'gi')) || []).length
          })
        }
      }
    }

    return results.sort((a, b) => b.matchCount - a.matchCount)
  } catch (error) {
    console.error('Error searching notes:', error)
    return []
  }
})

// IPC处理：导入文件
ipcMain.handle('import-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: '文本文件', extensions: ['txt'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0]
      const content = await readFile(filePath, 'utf-8')
      const filename = filePath.split(/[/\\]/).pop() || '导入的笔记'

      return {
        title: filename.replace(/\.[^/.]+$/, ''),
        content: content
      }
    }

    return null
  } catch (error) {
    console.error('Error importing file:', error)
    return null
  }
})

// IPC处理：导出文件
ipcMain.handle('export-file', async (_, { content, title }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: `${title}.md`,
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: '文本文件', extensions: ['txt'] }
      ]
    })

    if (!result.canceled && result.filePath) {
      await writeFile(result.filePath, content)
      return { success: true, path: result.filePath }
    }

    return { success: false }
  } catch (error) {
    console.error('Error exporting file:', error)
    return { success: false }
  }
})

// IPC处理：打开外部链接
ipcMain.handle('open-external', async (_, url) => {
  await shell.openExternal(url)
})

// IPC处理：获取应用信息
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    storagePath: getStoragePath()
  }
})
