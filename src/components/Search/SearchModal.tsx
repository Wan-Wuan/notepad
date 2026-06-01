import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, Clock, Star } from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { useAppStore } from '../../stores/appStore'
import { formatDate, truncateText, extractPlainText, highlightText } from '../../utils/fileUtils'
import { clsx } from 'clsx'

export const SearchModal = () => {
  const { notes, setCurrentNote } = useNoteStore()
  const { toggleSearch } = useAppStore()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof notes>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 搜索笔记
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery)
      const contentMatch = note.content.toLowerCase().includes(lowerQuery)
      const tagMatch = note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      return titleMatch || contentMatch || tagMatch
    })

    // 按匹配度排序
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(lowerQuery) ? 2 : 0
      const bTitle = b.title.toLowerCase().includes(lowerQuery) ? 2 : 0
      const aTags = a.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ? 1 : 0
      const bTags = b.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ? 1 : 0

      return (bTitle + bTags) - (aTitle + aTags)
    })

    setResults(filtered)
    setSelectedIndex(0)
  }, [query, notes])

  // 自动聚焦
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          setCurrentNote(results[selectedIndex])
          toggleSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        toggleSearch()
        break
    }
  }

  // 选择笔记
  const handleSelectNote = (note: typeof notes[0]) => {
    setCurrentNote(note)
    toggleSearch()
  }

  // 高亮匹配文本
  const highlightMatch = (text: string, maxLength?: number) => {
    let displayText = text
    if (maxLength) {
      displayText = truncateText(extractPlainText(text), maxLength)
    }
    return highlightText(displayText, query)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleSearch}
      />

      {/* 搜索框 */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索笔记标题、内容或标签..."
            className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            ESC
          </kbd>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[400px] overflow-y-auto">
          {query && results.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              <p>未找到匹配的笔记</p>
              <p className="text-sm mt-1">尝试使用不同的关键词</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={clsx(
                    'w-full px-4 py-3 text-left transition-colors',
                    index === selectedIndex
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <FileText
                      size={18}
                      className={clsx(
                        'mt-0.5 flex-shrink-0',
                        index === selectedIndex
                          ? 'text-primary-500'
                          : 'text-gray-400 dark:text-gray-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={clsx(
                            'font-medium truncate',
                            index === selectedIndex
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-900 dark:text-white'
                          )}
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(note.title)
                          }}
                        />
                        {note.isFavorite && (
                          <Star size={14} className="text-yellow-500 flex-shrink-0" fill="currentColor" />
                        )}
                        {note.isPinned && (
                          <span className="text-xs">📌</span>
                        )}
                      </div>

                      {note.content && (
                        <p
                          className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(note.content, 150)
                          }}
                        />
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(note.updatedAt)}
                        </span>

                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className={clsx(
                                  'text-xs px-1.5 py-0.5 rounded',
                                  tag.toLowerCase().includes(query.toLowerCase())
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                )}
                                dangerouslySetInnerHTML={{
                                  __html: highlightMatch(tag)
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              <p>输入关键词搜索笔记</p>
              <p className="text-sm mt-1">支持标题、内容和标签搜索</p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{results.length} 个结果</span>
            <div className="flex items-center gap-2">
              <span>↑↓ 导航</span>
              <span>↵ 选择</span>
              <span>ESC 关闭</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
