import { useState } from 'react'
import {
  Folder,
  FolderPlus,
  Star,
  Clock,
  Tag,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2
} from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { useAppStore } from '../../stores/appStore'
import { createFolder } from '../../utils/fileUtils'
import { clsx } from 'clsx'

export const Sidebar = () => {
  const { folders, currentFolderId, setCurrentFolderId, addFolder, updateFolder, deleteFolder, notes } = useNoteStore()
  const { toggleSettings, toggleSearch, isSidebarOpen } = useAppStore()

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ folderId: string; x: number; y: number } | null>(null)

  // 获取笔记数量
  const getNoteCount = (folderId: string | null) => {
    return notes.filter((n) => n.folderId === folderId).length
  }

  // 获取收藏笔记数量
  const getFavoriteCount = () => {
    return notes.filter((n) => n.isFavorite).length
  }

  // 切换文件夹展开状态
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  // 创建新文件夹
  const handleCreateFolder = async () => {
    const newFolder = createFolder('新建文件夹')
    addFolder(newFolder)
    await window.electronAPI.saveFolders([...folders, newFolder])
    setEditingFolderId(newFolder.id)
    setEditingName(newFolder.name)
  }

  // 重命名文件夹
  const handleRenameFolder = async (folderId: string) => {
    if (editingName.trim()) {
      const folder = folders.find((f) => f.id === folderId)
      if (folder) {
        const updatedFolder = { ...folder, name: editingName.trim(), updatedAt: new Date().toISOString() }
        updateFolder(updatedFolder)
        await window.electronAPI.saveFolders(
          folders.map((f) => (f.id === folderId ? updatedFolder : f))
        )
      }
    }
    setEditingFolderId(null)
    setEditingName('')
  }

  // 删除文件夹
  const handleDeleteFolder = async (folderId: string) => {
    deleteFolder(folderId)
    await window.electronAPI.saveFolders(folders.filter((f) => f.id !== folderId))
    setContextMenu(null)
  }

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    setContextMenu({ folderId, x: e.clientX, y: e.clientY })
  }

  // 关闭上下文菜单
  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  if (!isSidebarOpen) {
    return null
  }

  return (
    <aside
      className="w-sidebar bg-sidebar-bg border-r border-sidebar-border flex flex-col h-full"
      onClick={handleCloseContextMenu}
    >
      {/* 应用标题 */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">笔记软件</h1>
      </div>

      {/* 搜索按钮 */}
      <div className="px-3 py-2">
        <button
          onClick={toggleSearch}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <Search size={16} />
          <span>搜索笔记...</span>
          <kbd className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* 智能文件夹 */}
      <div className="px-3 py-2">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
          智能文件夹
        </div>
        <button
          onClick={() => setCurrentFolderId(null)}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
            currentFolderId === null
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-sidebar-hover dark:hover:bg-gray-800'
          )}
        >
          <Clock size={16} />
          <span>所有笔记</span>
          <span className="ml-auto text-xs text-gray-400">{notes.length}</span>
        </button>
        <button
          onClick={() => setCurrentFolderId('favorites')}
          className={clsx(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
            currentFolderId === 'favorites'
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-sidebar-hover dark:hover:bg-gray-800'
          )}
        >
          <Star size={16} />
          <span>收藏</span>
          <span className="ml-auto text-xs text-gray-400">{getFavoriteCount()}</span>
        </button>
      </div>

      {/* 文件夹列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
            文件夹
          </div>
          <button
            onClick={handleCreateFolder}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="新建文件夹"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        <div className="space-y-0.5">
          {folders.map((folder) => (
            <div key={folder.id}>
              <div
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group cursor-pointer',
                  currentFolderId === folder.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-sidebar-hover dark:hover:bg-gray-800'
                )}
                onClick={() => setCurrentFolderId(folder.id)}
                onContextMenu={(e) => handleContextMenu(e, folder.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(folder.id)
                  }}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>

                {editingFolderId === folder.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRenameFolder(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameFolder(folder.id)
                      }
                      if (e.key === 'Escape') {
                        setEditingFolderId(null)
                        setEditingName('')
                      }
                    }}
                    className="flex-1 bg-white dark:bg-gray-800 border border-primary-300 dark:border-primary-600 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <Folder size={16} style={{ color: folder.color }} />
                    <span className="flex-1 truncate">{folder.name}</span>
                    <span className="text-xs text-gray-400">{getNoteCount(folder.id)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleContextMenu(e, folder.id)
                      }}
                      className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* 子文件夹 */}
              {expandedFolders.has(folder.id) && (
                <div className="ml-4 space-y-0.5">
                  {folders
                    .filter((f) => f.parentId === folder.id)
                    .map((subfolder) => (
                      <div
                        key={subfolder.id}
                        className={clsx(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
                          currentFolderId === subfolder.id
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-sidebar-hover dark:hover:bg-gray-800'
                        )}
                        onClick={() => setCurrentFolderId(subfolder.id)}
                      >
                        <Folder size={16} style={{ color: subfolder.color }} />
                        <span className="flex-1 truncate">{subfolder.name}</span>
                        <span className="text-xs text-gray-400">{getNoteCount(subfolder.id)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 标签 */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
          标签
        </div>
        <div className="flex flex-wrap gap-1 px-2">
          {Array.from(new Set(notes.flatMap((n) => n.tags))).slice(0, 10).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 底部设置按钮 */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={toggleSettings}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-sidebar-hover dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings size={16} />
          <span>设置</span>
        </button>
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setEditingFolderId(contextMenu.folderId)
              setEditingName(folders.find((f) => f.id === contextMenu.folderId)?.name || '')
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Pencil size={14} />
            <span>重命名</span>
          </button>
          <button
            onClick={() => handleDeleteFolder(contextMenu.folderId)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={14} />
            <span>删除</span>
          </button>
        </div>
      )}
    </aside>
  )
}
