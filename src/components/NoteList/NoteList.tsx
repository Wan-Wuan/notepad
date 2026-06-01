import { useMemo } from 'react'
import {
  Plus,
  Star,
  MoreHorizontal,
  List,
  LayoutGrid,
  AlignJustify,
  ArrowUpDown,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { useAppStore } from '../../stores/appStore'
import { createNote, formatDate, truncateText, extractPlainText } from '../../utils/fileUtils'
import { clsx } from 'clsx'
import { Note, SortBy, ViewMode } from '../../types'

export const NoteList = () => {
  const {
    notes,
    currentNote,
    currentFolderId,
    setCurrentNote,
    addNote,
    updateNote,
    deleteNote
  } = useNoteStore()

  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isNoteListOpen
  } = useAppStore()

  // 过滤和排序笔记
  const filteredNotes = useMemo(() => {
    let filtered = [...notes]

    // 按文件夹过滤
    if (currentFolderId === 'favorites') {
      filtered = filtered.filter((n) => n.isFavorite)
    } else if (currentFolderId) {
      filtered = filtered.filter((n) => n.folderId === currentFolderId)
    }

    // 排序
    filtered.sort((a, b) => {
      // 置顶笔记优先
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      let comparison = 0
      switch (sortBy) {
        case 'updatedAt':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          break
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === 'asc' ? -comparison : comparison
    })

    return filtered
  }, [notes, currentFolderId, sortBy, sortOrder])

  // 创建新笔记
  const handleCreateNote = async () => {
    const newNote = createNote(currentFolderId === 'favorites' ? null : currentFolderId)
    addNote(newNote)
    setCurrentNote(newNote)
    await window.electronAPI.saveNote(newNote)
  }

  // 切换收藏状态
  const handleToggleFavorite = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation()
    const updatedNote = {
      ...note,
      isFavorite: !note.isFavorite,
      updatedAt: new Date().toISOString()
    }
    updateNote(updatedNote)
    await window.electronAPI.saveNote(updatedNote)
  }

  // 切换置顶状态
  const handleTogglePin = async (note: Note) => {
    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString()
    }
    updateNote(updatedNote)
    await window.electronAPI.saveNote(updatedNote)
  }

  // 删除笔记
  const handleDeleteNote = async (note: Note) => {
    deleteNote(note.id)
    await window.electronAPI.deleteNote(note.id)
  }

  // 获取视图模式图标
  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'list':
        return <List size={16} />
      case 'grid':
        return <LayoutGrid size={16} />
      case 'compact':
        return <AlignJustify size={16} />
    }
  }

  // 获取排序图标
  const getSortIcon = () => {
    return sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
  }

  if (!isNoteListOpen) {
    return null
  }

  return (
    <div className="w-notelist border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 头部工具栏 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            {currentFolderId === 'favorites'
              ? '收藏的笔记'
              : currentFolderId
              ? notes.find((n) => n.folderId === currentFolderId)?.title || '笔记'
              : '所有笔记'}
          </h2>
          <button
            onClick={handleCreateNote}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="新建笔记"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* 视图和排序控制 */}
        <div className="flex items-center gap-2">
          {/* 视图模式切换 */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {(['list', 'grid', 'compact'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={clsx(
                  'p-1.5 rounded-md transition-colors',
                  viewMode === mode
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
                title={mode === 'list' ? '列表视图' : mode === 'grid' ? '网格视图' : '紧凑视图'}
              >
                {getViewModeIcon(mode)}
              </button>
            ))}
          </div>

          {/* 排序选项 */}
          <div className="flex items-center gap-1 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="updatedAt">修改时间</option>
              <option value="createdAt">创建时间</option>
              <option value="title">标题</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={sortOrder === 'asc' ? '升序' : '降序'}
            >
              {getSortIcon()}
            </button>
          </div>
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">暂无笔记</p>
            <button
              onClick={handleCreateNote}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
            >
              创建第一篇笔记
            </button>
          </div>
        ) : (
          <div
            className={clsx(
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-2 p-2'
                : 'divide-y divide-gray-100 dark:divide-gray-800'
            )}
          >
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setCurrentNote(note)}
                className={clsx(
                  'cursor-pointer transition-colors group',
                  viewMode === 'grid'
                    ? 'p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                    : viewMode === 'compact'
                    ? 'px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    : 'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  currentNote?.id === note.id &&
                    (viewMode === 'grid'
                      ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'bg-primary-50 dark:bg-primary-900/20')
                )}
              >
                {/* 笔记标题 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {note.isPinned && (
                        <span className="text-primary-500 dark:text-primary-400">📌</span>
                      )}
                      <h3
                        className={clsx(
                          'font-medium truncate',
                          viewMode === 'compact' ? 'text-sm' : 'text-sm',
                          currentNote?.id === note.id
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-900 dark:text-white'
                        )}
                      >
                        {note.title || '无标题笔记'}
                      </h3>
                    </div>

                    {/* 笔记预览 */}
                    {viewMode !== 'compact' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {truncateText(extractPlainText(note.content), viewMode === 'grid' ? 80 : 120)}
                      </p>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleFavorite(e, note)}
                      className={clsx(
                        'p-1 rounded transition-colors',
                        note.isFavorite
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      )}
                      title={note.isFavorite ? '取消收藏' : '收藏'}
                    >
                      <Star size={14} fill={note.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // 显示更多操作菜单
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>

                {/* 笔记元数据 */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(note.updatedAt)}
                  </span>

                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{filteredNotes.length} 篇笔记</span>
          <span>
            {notes.filter((n) => n.isFavorite).length} 篇收藏
          </span>
        </div>
      </div>
    </div>
  )
}
