import { useEffect, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Code2,
  MoreHorizontal,
  Download,
  Trash2,
  Pin,
  Star,
  Tag,
  Clock,
  FileText
} from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { useAppStore } from '../../stores/appStore'
import { debounce, countWords, calculateReadingTime } from '../../utils/fileUtils'
import { clsx } from 'clsx'

const lowlight = createLowlight(common)

export const Editor = () => {
  const { currentNote, updateNote, deleteNote } = useNoteStore()
  const { settings } = useAppStore()

  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showToolbar, setShowToolbar] = useState(true)
  const [showMetadata, setShowMetadata] = useState(false)
  const [tagInput, setTagInput] = useState('')

  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false
      }),
      Placeholder.configure({
        placeholder: '开始写作...'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-500 hover:text-primary-600 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Underline,
      Highlight.configure({
        multicolor: true
      }),
      CodeBlockLowlight.configure({
        lowlight
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      if (currentNote) {
        const content = editor.getHTML()
        const wordCount = countWords(content)
        const readingTime = calculateReadingTime(wordCount)

        const updatedNote = {
          ...currentNote,
          content,
          metadata: {
            ...currentNote.metadata,
            wordCount,
            readingTime
          },
          updatedAt: new Date().toISOString()
        }

        updateNote(updatedNote)
        debouncedSave(updatedNote)
      }
    }
  })

  // 防抖保存
  const debouncedSave = useCallback(
    debounce(async (note) => {
      setIsSaving(true)
      try {
        await window.electronAPI.saveNote(note)
        setLastSaved(new Date())
      } catch (error) {
        console.error('保存失败:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000),
    []
  )

  // 加载笔记内容
  useEffect(() => {
    if (currentNote && editor) {
      setTitle(currentNote.title)
      editor.commands.setContent(currentNote.content || '')
    }
  }, [currentNote?.id])

  // 保存标题
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    if (currentNote) {
      const updatedNote = {
        ...currentNote,
        title: e.target.value,
        updatedAt: new Date().toISOString()
      }
      updateNote(updatedNote)
      debouncedSave(updatedNote)
    }
  }

  // 添加标签
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && currentNote) {
      const newTag = tagInput.trim()
      if (!currentNote.tags.includes(newTag)) {
        const updatedNote = {
          ...currentNote,
          tags: [...currentNote.tags, newTag],
          updatedAt: new Date().toISOString()
        }
        updateNote(updatedNote)
        debouncedSave(updatedNote)
      }
      setTagInput('')
    }
  }

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    if (currentNote) {
      const updatedNote = {
        ...currentNote,
        tags: currentNote.tags.filter((t) => t !== tag),
        updatedAt: new Date().toISOString()
      }
      updateNote(updatedNote)
      debouncedSave(updatedNote)
    }
  }

  // 切换收藏
  const handleToggleFavorite = () => {
    if (currentNote) {
      const updatedNote = {
        ...currentNote,
        isFavorite: !currentNote.isFavorite,
        updatedAt: new Date().toISOString()
      }
      updateNote(updatedNote)
      debouncedSave(updatedNote)
    }
  }

  // 切换置顶
  const handleTogglePin = () => {
    if (currentNote) {
      const updatedNote = {
        ...currentNote,
        isPinned: !currentNote.isPinned,
        updatedAt: new Date().toISOString()
      }
      updateNote(updatedNote)
      debouncedSave(updatedNote)
    }
  }

  // 删除笔记
  const handleDeleteNote = async () => {
    if (currentNote && confirm('确定要删除这篇笔记吗？')) {
      deleteNote(currentNote.id)
      await window.electronAPI.deleteNote(currentNote.id)
    }
  }

  // 导出笔记
  const handleExportNote = async () => {
    if (currentNote) {
      await window.electronAPI.exportFile({
        content: currentNote.content,
        title: currentNote.title
      })
    }
  }

  // 插入图片
  const handleInsertImage = async () => {
    const result = await window.electronAPI.importFile()
    if (result && editor) {
      editor.chain().focus().setImage({ src: result.content }).run()
    }
  }

  // 插入链接
  const handleInsertLink = () => {
    const url = window.prompt('请输入链接地址:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  // 插入表格
  const handleInsertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
    }
  }

  // 工具栏按钮配置
  const toolbarButtons = [
    {
      icon: <Bold size={16} />,
      title: '加粗',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold')
    },
    {
      icon: <Italic size={16} />,
      title: '斜体',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic')
    },
    {
      icon: <UnderlineIcon size={16} />,
      title: '下划线',
      action: () => editor?.chain().focus().toggleUnderline().run(),
      isActive: () => editor?.isActive('underline')
    },
    {
      icon: <Strikethrough size={16} />,
      title: '删除线',
      action: () => editor?.chain().focus().toggleStrike().run(),
      isActive: () => editor?.isActive('strike')
    },
    {
      icon: <Highlighter size={16} />,
      title: '高亮',
      action: () => editor?.chain().focus().toggleHighlight().run(),
      isActive: () => editor?.isActive('highlight')
    },
    { type: 'divider' },
    {
      icon: <Heading1 size={16} />,
      title: '标题1',
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive('heading', { level: 1 })
    },
    {
      icon: <Heading2 size={16} />,
      title: '标题2',
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 })
    },
    {
      icon: <Heading3 size={16} />,
      title: '标题3',
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor?.isActive('heading', { level: 3 })
    },
    { type: 'divider' },
    {
      icon: <List size={16} />,
      title: '无序列表',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList')
    },
    {
      icon: <ListOrdered size={16} />,
      title: '有序列表',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList')
    },
    {
      icon: <ListChecks size={16} />,
      title: '任务列表',
      action: () => editor?.chain().focus().toggleTaskList().run(),
      isActive: () => editor?.isActive('taskList')
    },
    { type: 'divider' },
    {
      icon: <Quote size={16} />,
      title: '引用',
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive('blockquote')
    },
    {
      icon: <Code size={16} />,
      title: '行内代码',
      action: () => editor?.chain().focus().toggleCode().run(),
      isActive: () => editor?.isActive('code')
    },
    {
      icon: <Code2 size={16} />,
      title: '代码块',
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive('codeBlock')
    },
    { type: 'divider' },
    {
      icon: <LinkIcon size={16} />,
      title: '插入链接',
      action: handleInsertLink,
      isActive: () => editor?.isActive('link')
    },
    {
      icon: <ImageIcon size={16} />,
      title: '插入图片',
      action: handleInsertImage
    },
    {
      icon: <TableIcon size={16} />,
      title: '插入表格',
      action: handleInsertTable
    },
    {
      icon: <Minus size={16} />,
      title: '分割线',
      action: () => editor?.chain().focus().setHorizontalRule().run()
    },
    { type: 'divider' },
    {
      icon: <Undo size={16} />,
      title: '撤销',
      action: () => editor?.chain().focus().undo().run()
    },
    {
      icon: <Redo size={16} />,
      title: '重做',
      action: () => editor?.chain().focus().redo().run()
    }
  ]

  // 空状态
  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-bg">
        <div className="text-center text-gray-400 dark:text-gray-500">
          <FileText size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">选择一篇笔记开始编辑</h3>
          <p className="text-sm">或者创建一篇新笔记</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-editor-bg">
      {/* 编辑器头部 */}
      <div className="border-b border-editor-border">
        {/* 标题和操作栏 */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="无标题笔记"
              className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* 保存状态 */}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {isSaving ? '保存中...' : lastSaved ? `已保存 ${lastSaved.toLocaleTimeString()}` : ''}
            </span>

            {/* 操作按钮 */}
            <button
              onClick={handleToggleFavorite}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                currentNote.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              title={currentNote.isFavorite ? '取消收藏' : '收藏'}
            >
              <Star size={18} fill={currentNote.isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={handleTogglePin}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                currentNote.isPinned
                  ? 'text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              title={currentNote.isPinned ? '取消置顶' : '置顶'}
            >
              <Pin size={18} />
            </button>

            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="笔记信息"
            >
              <Clock size={18} />
            </button>

            <button
              onClick={handleExportNote}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="导出笔记"
            >
              <Download size={18} />
            </button>

            <button
              onClick={handleDeleteNote}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="删除笔记"
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="切换工具栏"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* 标签栏 */}
        <div className="px-6 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-gray-400" />
            {currentNote.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="添加标签..."
              className="text-xs bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 w-20"
            />
          </div>
        </div>

        {/* 笔记元数据 */}
        {showMetadata && (
          <div className="px-6 pb-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>字数: {currentNote.metadata.wordCount}</span>
            <span>阅读时间: {currentNote.metadata.readingTime} 分钟</span>
            <span>创建时间: {new Date(currentNote.createdAt).toLocaleString('zh-CN')}</span>
            <span>修改时间: {new Date(currentNote.updatedAt).toLocaleString('zh-CN')}</span>
          </div>
        )}

        {/* 工具栏 */}
        {showToolbar && (
          <div className="px-6 pb-3">
            <div className="flex items-center gap-0.5 flex-wrap bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1">
              {toolbarButtons.map((button, index) => {
                if (button.type === 'divider') {
                  return <div key={index} className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                }

                return (
                  <button
                    key={index}
                    onClick={button.action}
                    className={clsx(
                      'p-1.5 rounded-md transition-colors',
                      button.isActive?.()
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                    )}
                    title={button.title}
                  >
                    {button.icon}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent editor={editor} className="min-h-full" />
      </div>

      {/* 底部状态栏 */}
      <div className="border-t border-editor-border px-6 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>{currentNote.metadata.wordCount} 字</span>
          <span>约 {currentNote.metadata.readingTime} 分钟阅读</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Markdown</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}
