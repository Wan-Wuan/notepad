import { useState, useEffect, useRef } from 'react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface HeadingItem {
  id: string
  level: number
  text: string
  children?: HeadingItem[]
}

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  FileText: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Bold: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  Italic: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  Code: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  List: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Quote: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 8c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-2h-2v-2h2V8h-2zm6 0c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-2h-2v-2h2V8h-2z"/></svg>,
  Link: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  GripVertical: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>,
  ListTree: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12h-8"/><path d="M21 6H8"/><path d="M21 18h-8"/><path d="M3 6v4c0 1.1.9 2 2 2h3"/><path d="M3 10v4c0 1.1.9 2 2 2h3"/></svg>,
  ChevronRight: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronDown: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  AlertTriangle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  FoldVertical: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [draggedNote, setDraggedNote] = useState<string | null>(null)
  const [dragOverNote, setDragOverNote] = useState<string | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | null>(null)
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [showOutline, setShowOutline] = useState(true)
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null)
  const [collapsedHeadings, setCollapsedHeadings] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; noteId: string; noteTitle: string }>({ show: false, noteId: '', noteTitle: '' })
  const [copySuccess, setCopySuccess] = useState(false)
  const [wordCount, setWordCount] = useState({ characters: 0, words: 0 })
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth')
    return saved ? parseInt(saved) : 280
  })
  const [outlineWidth, setOutlineWidth] = useState(() => {
    const saved = localStorage.getItem('outlineWidth')
    return saved ? parseInt(saved) : 220
  })
  const [isDragging, setIsDragging] = useState<'sidebar' | 'outline' | null>(null)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (window.electronAPI) {
          const loadedNotes = await window.electronAPI.getNotes()
          setNotes(loadedNotes)
          if (loadedNotes.length > 0) setCurrentNote(loadedNotes[0])
        }
      } catch (error) { console.error('加载数据失败:', error) }
    }
    loadData()
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleCreateNote() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (editorRef.current && currentNote) {
      editorRef.current.innerHTML = currentNote.content
      extractHeadings(currentNote.content)
      updateWordCount(currentNote.content)
    }
  }, [currentNote?.id])

  useEffect(() => { localStorage.setItem('sidebarWidth', sidebarWidth.toString()) }, [sidebarWidth])
  useEffect(() => { localStorage.setItem('outlineWidth', outlineWidth.toString()) }, [outlineWidth])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - dragStartX.current
      if (isDragging === 'sidebar') setSidebarWidth(Math.max(200, Math.min(400, dragStartWidth.current + diff)))
      else if (isDragging === 'outline') setOutlineWidth(Math.max(150, Math.min(350, dragStartWidth.current - diff)))
    }
    const handleMouseUp = () => setIsDragging(null)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp) }
  }, [isDragging])

  const handleResizeStart = (e: React.MouseEvent, panel: 'sidebar' | 'outline') => {
    e.preventDefault()
    setIsDragging(panel)
    dragStartX.current = e.clientX
    dragStartWidth.current = panel === 'sidebar' ? sidebarWidth : outlineWidth
  }

  // 构建大纲树结构
  const buildHeadingTree = (flatHeadings: { level: number; text: string }[]): HeadingItem[] => {
    const root: HeadingItem[] = []
    const stack: { item: HeadingItem; level: number }[] = []
    
    flatHeadings.forEach((h, index) => {
      const item: HeadingItem = { id: `heading-${index}`, level: h.level, text: h.text, children: [] }
      
      // 弹出栈中级别 >= 当前级别的项
      while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
        stack.pop()
      }
      
      if (stack.length === 0) {
        root.push(item)
      } else {
        const parent = stack[stack.length - 1].item
        if (!parent.children) parent.children = []
        parent.children.push(item)
      }
      
      stack.push({ item, level: h.level })
    })
    
    return root
  }

  const extractHeadings = (content: string) => {
    const div = document.createElement('div')
    div.innerHTML = content
    const headingElements = div.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const flatHeadings: { level: number; text: string }[] = []
    headingElements.forEach(el => {
      const level = parseInt(el.tagName.charAt(1))
      const text = el.textContent || ''
      if (text.trim()) flatHeadings.push({ level, text: text.trim() })
    })
    setHeadings(buildHeadingTree(flatHeadings))
  }

  const updateWordCount = (content: string) => {
    const div = document.createElement('div')
    div.innerHTML = content
    const text = div.textContent || div.innerText || ''
    setWordCount({ characters: text.length, words: text.trim() ? text.trim().split(/\s+/).length : 0 })
  }

  const scrollToHeading = (headingText: string) => {
    if (!editorRef.current) return
    const headings = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
    for (const heading of headings) {
      if (heading.textContent?.trim() === headingText) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setActiveHeadingId(headingText)
        setTimeout(() => setActiveHeadingId(null), 2000)
        break
      }
    }
  }

  // 切换标题折叠状态
  const toggleCollapse = (headingId: string) => {
    setCollapsedHeadings(prev => {
      const next = new Set(prev)
      if (next.has(headingId)) next.delete(headingId)
      else next.add(headingId)
      return next
    })
  }

  // 全部折叠/展开
  const toggleAllCollapse = () => {
    if (collapsedHeadings.size > 0) {
      setCollapsedHeadings(new Set())
    } else {
      const allIds = new Set<string>()
      const collectIds = (items: HeadingItem[]) => {
        items.forEach(item => {
          if (item.children && item.children.length > 0) {
            allIds.add(item.id)
            collectIds(item.children)
          }
        })
      }
      collectIds(headings)
      setCollapsedHeadings(allIds)
    }
  }

  // 渲染大纲项
  const renderOutlineItem = (item: HeadingItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isCollapsed = collapsedHeadings.has(item.id)
    
    return (
      <div key={item.id}>
        <div
          onClick={() => scrollToHeading(item.text)}
          style={{
            ...styles.outlineItem,
            paddingLeft: `${depth * 16 + 12}px`,
            ...(activeHeadingId === item.text ? styles.outlineItemActive : {})
          }}
        >
          {hasChildren ? (
            <div
              onClick={(e) => { e.stopPropagation(); toggleCollapse(item.id) }}
              style={styles.collapseBtn}
            >
              {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronDown />}
            </div>
          ) : (
            <div style={styles.collapsePlaceholder} />
          )}
          <span style={styles.outlineText}>{item.text}</span>
          {hasChildren && (
            <span style={styles.childCount}>{item.children!.length}</span>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <div>
            {item.children!.map(child => renderOutlineItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const saveNote = async (note: Note) => { if (window.electronAPI) await window.electronAPI.saveNote(note) }

  const handleCreateNote = async () => {
    const newNote: Note = { id: Date.now().toString(), title: '', content: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    setNotes([newNote, ...notes]); setCurrentNote(newNote); await saveNote(newNote)
  }

  const showDeleteConfirm = (noteId: string, noteTitle: string) => {
    setDeleteConfirm({ show: true, noteId, noteTitle: noteTitle || '无标题笔记' })
  }

  const confirmDeleteNote = async () => {
    const { noteId } = deleteConfirm
    setNotes(notes.filter(n => n.id !== noteId))
    if (currentNote?.id === noteId) setCurrentNote(notes.find(n => n.id !== noteId) || null)
    if (window.electronAPI) await window.electronAPI.deleteNote(noteId)
    setDeleteConfirm({ show: false, noteId: '', noteTitle: '' })
  }

  const handleTitleChange = async (title: string) => {
    if (!currentNote) return
    const updated = { ...currentNote, title, updatedAt: new Date().toISOString() }
    setCurrentNote(updated); setNotes(notes.map(n => n.id === updated.id ? updated : n)); await saveNote(updated)
  }

  const handleContentChange = async () => {
    if (!currentNote || !editorRef.current) return
    const content = editorRef.current.innerHTML
    const updated = { ...currentNote, content, updatedAt: new Date().toISOString() }
    setCurrentNote(updated); setNotes(notes.map(n => n.id === updated.id ? updated : n))
    await saveNote(updated); extractHeadings(content); updateWordCount(content)
  }

  const exportAsMarkdown = () => {
    if (!currentNote) return
    const div = document.createElement('div'); div.innerHTML = currentNote.content
    let markdown = div.textContent || div.innerText || ''
    if (currentNote.title) markdown = `# ${currentNote.title}\n\n${markdown}`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `${currentNote.title || '笔记'}.md`; a.click(); URL.revokeObjectURL(url)
  }

  const copyContent = async () => {
    if (!currentNote) return
    const div = document.createElement('div'); div.innerHTML = currentNote.content
    const text = div.textContent || div.innerText || ''
    try { await navigator.clipboard.writeText(text); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000) } catch (err) { console.error('复制失败:', err) }
  }

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNote(noteId); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', noteId)
    setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.5' }, 0)
  }
  const handleDragEnd = (e: React.DragEvent) => { (e.target as HTMLElement).style.opacity = '1'; setDraggedNote(null); setDragOverNote(null); setDragOverPosition(null) }
  const handleDragOver = (e: React.DragEvent, noteId: string) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (noteId === draggedNote) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOverNote(noteId); setDragOverPosition(e.clientY - rect.top < rect.height / 2 ? 'before' : 'after')
  }
  const handleDrop = async (e: React.DragEvent, targetNoteId: string) => {
    e.preventDefault()
    if (!draggedNote || draggedNote === targetNoteId) { setDraggedNote(null); setDragOverNote(null); setDragOverPosition(null); return }
    const notesCopy = [...notes]; const di = notesCopy.findIndex(n => n.id === draggedNote); const ti = notesCopy.findIndex(n => n.id === targetNoteId)
    if (di === -1 || ti === -1) return
    const [removed] = notesCopy.splice(di, 1)
    const insertIndex = dragOverPosition === 'after' ? (di < ti ? ti : ti + 1) : (di < ti ? ti - 1 : ti)
    notesCopy.splice(insertIndex, 0, removed); setNotes(notesCopy); setDraggedNote(null); setDragOverNote(null); setDragOverPosition(null)
    if (window.electronAPI) for (const note of notesCopy) await window.electronAPI.saveNote(note)
  }

  const getNoteItemStyle = (noteId: string): React.CSSProperties => {
    const base: React.CSSProperties = { ...styles.noteItem, ...(currentNote?.id === noteId ? styles.noteItemActive : {}) }
    if (draggedNote === noteId) return { ...base, opacity: 0.5 }
    if (dragOverNote === noteId) return { ...base, borderTop: dragOverPosition === 'before' ? '2px solid #3b82f6' : undefined, borderBottom: dragOverPosition === 'after' ? '2px solid #3b82f6' : undefined }
    return base
  }

  const execCommand = (c: string, v?: string) => { document.execCommand(c, false, v); editorRef.current?.focus(); updateActiveFormats() }
  const updateActiveFormats = () => { const f = new Set<string>(); if (document.queryCommandState('bold')) f.add('bold'); if (document.queryCommandState('italic')) f.add('italic'); setActiveFormats(f) }

  const insertCodeBlock = () => { const c = prompt('输入代码:'); if (c) { document.execCommand('insertHTML', false, `<pre style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:14px;overflow-x:auto;margin:12px 0"><code>${c.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre><p></p>`); handleContentChange() } }
  const insertInlineCode = () => { const s = window.getSelection(); const t = s?.toString() || prompt('输入代码:') || ''; if (t) { document.execCommand('insertHTML', false, `<code style="background:#f1f5f9;color:#e11d48;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">${t}</code>`); handleContentChange() } }
  const insertHeading = (l: number) => { execCommand('formatBlock', `h${l}`); handleContentChange() }
  const insertQuote = () => { document.execCommand('insertHTML', false, '<blockquote style="border-left:4px solid #3b82f6;padding-left:16px;margin:12px 0;color:#64748b;font-style:italic">引用内容</blockquote><p></p>'); handleContentChange() }
  const insertList = (o: boolean) => { execCommand(o ? 'insertOrderedList' : 'insertUnorderedList'); handleContentChange() }
  const insertLink = () => { const u = prompt('输入链接地址:'); if (u) { execCommand('createLink', u); handleContentChange() } }
  const insertDivider = () => { document.execCommand('insertHTML', false, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"><p></p>'); handleContentChange() }
  const insertHighlight = () => { const s = window.getSelection(); if (s?.toString()) { document.execCommand('insertHTML', false, `<mark style="background:#fef08a;padding:2px 4px;border-radius:2px">${s.toString()}</mark>`); handleContentChange() } }
  const insertTaskList = () => { document.execCommand('insertHTML', false, '<div style="margin:8px 0"><input type="checkbox" style="margin-right:8px">任务项</div><p></p>'); handleContentChange() }

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    if (diff < 60000) return '刚刚'; if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`; if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`; if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    return new Date(d).toLocaleDateString('zh-CN')
  }

  const filteredNotes = notes.filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  const getPreview = (c: string) => { if (!c) return '空白笔记'; const d = document.createElement('div'); d.innerHTML = c; const t = d.textContent || ''; return t.length > 60 ? t.substring(0, 60) + '...' : t }

  const renderResizeHandle = (panel: 'sidebar' | 'outline') => (
    <div style={{ ...styles.resizeHandle, ...(isDragging === panel ? styles.resizeHandleActive : {}) }} onMouseDown={(e) => handleResizeStart(e, panel)} />
  )

  return (
    <div style={styles.container}>
      <aside style={{ ...styles.sidebar, width: `${sidebarWidth}px` }}>
        <div style={styles.sidebarHeader}><h1 style={styles.appTitle}>笔记软件</h1></div>
        <div style={styles.searchWrapper}><div style={styles.searchBox}><Icons.Search /><input type="text" placeholder="搜索笔记..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} /></div></div>
        <div style={styles.newNoteWrapper}><button onClick={handleCreateNote} style={styles.newNoteBtn}><Icons.Plus /><span>新建笔记</span></button></div>
        <div style={styles.noteList}>
          {filteredNotes.length === 0 ? <div style={styles.emptyState}><p style={styles.emptyText}>暂无笔记</p></div> : filteredNotes.map(note => (
            <div key={note.id} draggable onDragStart={(e) => handleDragStart(e, note.id)} onDragEnd={handleDragEnd} onDragOver={(e) => handleDragOver(e, note.id)} onDragLeave={() => { setDragOverNote(null); setDragOverPosition(null) }} onDrop={(e) => handleDrop(e, note.id)} onClick={() => setCurrentNote(note)} style={getNoteItemStyle(note.id)}>
              <div style={styles.dragHandle}><Icons.GripVertical /></div>
              <div style={styles.noteItemContent}>
                <div style={styles.noteItemTitle}>{note.title || '无标题笔记'}</div>
                <div style={styles.noteItemPreview}>{getPreview(note.content)}</div>
                <div style={styles.noteItemMeta}><Icons.Clock /><span>{formatDate(note.updatedAt)}</span></div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); showDeleteConfirm(note.id, note.title) }} style={styles.deleteBtn} title="删除笔记"><Icons.Trash /></button>
            </div>
          ))}
        </div>
        <div style={styles.sidebarFooter}><span>{notes.length} 篇笔记</span><span style={styles.dragHint}>Ctrl+N 新建</span></div>
      </aside>

      {renderResizeHandle('sidebar')}

      <main style={styles.editor}>
        {currentNote ? (
          <>
            <div style={styles.editorHeader}><input type="text" value={currentNote.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="输入标题..." style={styles.titleInput} /></div>
            <div style={styles.toolbar}>
              <div style={styles.toolbarGroup}><button onClick={() => insertHeading(1)} style={styles.toolbarBtn}>H1</button><button onClick={() => insertHeading(2)} style={styles.toolbarBtn}>H2</button><button onClick={() => insertHeading(3)} style={styles.toolbarBtn}>H3</button></div>
              <div style={styles.toolbarDivider} />
              <div style={styles.toolbarGroup}><button onClick={() => execCommand('bold')} style={{ ...styles.toolbarBtn, ...(activeFormats.has('bold') ? styles.toolbarBtnActive : {}) }}><Icons.Bold /></button><button onClick={() => execCommand('italic')} style={{ ...styles.toolbarBtn, ...(activeFormats.has('italic') ? styles.toolbarBtnActive : {}) }}><Icons.Italic /></button><button onClick={insertHighlight} style={styles.toolbarBtn}><span style={{ background: '#fef08a', padding: '2px 4px', borderRadius: '2px' }}>A</span></button></div>
              <div style={styles.toolbarDivider} />
              <div style={styles.toolbarGroup}><button onClick={insertInlineCode} style={styles.toolbarBtn}><Icons.Code /></button><button onClick={insertCodeBlock} style={styles.toolbarBtn}>{'</>'}</button></div>
              <div style={styles.toolbarDivider} />
              <div style={styles.toolbarGroup}><button onClick={() => insertList(false)} style={styles.toolbarBtn}><Icons.List /></button><button onClick={() => insertList(true)} style={styles.toolbarBtn}>1.</button><button onClick={insertTaskList} style={styles.toolbarBtn}>☑</button></div>
              <div style={styles.toolbarDivider} />
              <div style={styles.toolbarGroup}><button onClick={insertQuote} style={styles.toolbarBtn}><Icons.Quote /></button><button onClick={insertLink} style={styles.toolbarBtn}><Icons.Link /></button><button onClick={insertDivider} style={styles.toolbarBtn}>—</button></div>
              <div style={styles.toolbarDivider} />
              <div style={styles.toolbarGroup}>
                <button onClick={() => setShowOutline(!showOutline)} style={{ ...styles.toolbarBtn, ...(showOutline ? styles.toolbarBtnActive : {}) }}><Icons.ListTree /></button>
                <button onClick={exportAsMarkdown} style={styles.toolbarBtn}><Icons.Download /></button>
                <button onClick={copyContent} style={{ ...styles.toolbarBtn, ...(copySuccess ? styles.toolbarBtnSuccess : {}) }}>{copySuccess ? <Icons.Check /> : <Icons.Copy />}</button>
              </div>
            </div>
            <div style={styles.editorContent}>
              <div ref={editorRef} contentEditable style={styles.contentEditable} onInput={handleContentChange} onSelect={updateActiveFormats} onBlur={handleContentChange} suppressContentEditableWarning data-placeholder="开始写作..." />
              {showOutline && headings.length > 0 && (
                <>
                  {renderResizeHandle('outline')}
                  <div style={{ ...styles.outlinePanel, width: `${outlineWidth}px` }}>
                    <div style={styles.outlineHeader}>
                      <Icons.ListTree /><span>大纲</span>
                      <button onClick={toggleAllCollapse} style={styles.collapseAllBtn} title={collapsedHeadings.size > 0 ? '全部展开' : '全部折叠'}>
                        <Icons.FoldVertical />
                      </button>
                    </div>
                    <div style={styles.outlineList}>
                      {headings.map(item => renderOutlineItem(item, 0))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={styles.statusBar}><span>{wordCount.characters} 字符 · {wordCount.words} 词</span><span>{formatDate(currentNote.updatedAt)}</span></div>
          </>
        ) : (
          <div style={styles.placeholder}><div style={styles.placeholderIcon}><Icons.FileText /></div><h3 style={styles.placeholderTitle}>选择一篇笔记开始编辑</h3><p style={styles.placeholderText}>或者点击左侧创建新笔记</p></div>
        )}
      </main>

      {deleteConfirm.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}><Icons.AlertTriangle /></div>
            <h3 style={styles.modalTitle}>确认删除</h3>
            <p style={styles.modalText}>确定要删除笔记 "{deleteConfirm.noteTitle}" 吗？此操作无法撤销。</p>
            <div style={styles.modalActions}>
              <button onClick={() => setDeleteConfirm({ show: false, noteId: '', noteTitle: '' })} style={styles.modalCancelBtn}>取消</button>
              <button onClick={confirmDeleteNote} style={styles.modalDeleteBtn}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#fff', fontFamily: 'sans-serif' },
  sidebar: { backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '20px 20px 16px', borderBottom: '1px solid #e2e8f0' },
  appTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 },
  searchWrapper: { padding: '12px 16px 8px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#94a3b8' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#0f172a', backgroundColor: 'transparent' },
  newNoteWrapper: { padding: '8px 16px 12px' },
  newNoteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  noteList: { flex: 1, overflowY: 'auto', padding: '0 8px' },
  emptyState: { padding: '40px 20px', textAlign: 'center' as const },
  emptyText: { color: '#94a3b8', fontSize: '14px', margin: 0 },
  noteItem: { display: 'flex', alignItems: 'flex-start', padding: '12px', marginBottom: '2px', borderRadius: '8px', cursor: 'pointer' },
  noteItemActive: { backgroundColor: '#eff6ff', borderLeft: '3px solid #3b82f6' },
  dragHandle: { display: 'flex', alignItems: 'center', padding: '4px 4px 4px 0', color: '#cbd5e1', cursor: 'grab' },
  noteItemContent: { flex: 1, minWidth: 0 },
  noteItemTitle: { fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const },
  noteItemPreview: { fontSize: '12px', color: '#64748b', marginBottom: '6px', lineHeight: '1.4', display: '-webkit-box' as const, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' as const },
  noteItemMeta: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8' },
  deleteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, borderRadius: '4px', flexShrink: 0 },
  sidebarFooter: { padding: '12px 20px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dragHint: { fontSize: '11px', color: '#cbd5e1' },
  editor: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: '#fff' },
  editorHeader: { padding: '24px 32px 16px', borderBottom: '1px solid #f1f5f9' },
  titleInput: { width: '100%', fontSize: '28px', fontWeight: 700, border: 'none', outline: 'none', color: '#0f172a', backgroundColor: 'transparent' },
  toolbar: { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 32px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', flexWrap: 'wrap' as const },
  toolbarGroup: { display: 'flex', alignItems: 'center', gap: '2px' },
  toolbarDivider: { width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px' },
  toolbarBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '32px', padding: '4px 8px', background: 'none', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: '#475569', cursor: 'pointer' },
  toolbarBtnActive: { backgroundColor: '#e0e7ff', color: '#3b82f6' },
  toolbarBtnSuccess: { backgroundColor: '#dcfce7', color: '#16a34a' },
  editorContent: { display: 'flex', flex: 1, overflow: 'hidden' },
  contentEditable: { flex: 1, padding: '24px 32px', fontSize: '15px', lineHeight: 1.8, color: '#334155', outline: 'none', overflowY: 'auto' as const },
  outlinePanel: { borderLeft: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  outlineHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, color: '#475569' },
  collapseAllBtn: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center' },
  outlineList: { flex: 1, overflowY: 'auto' as const, padding: '8px 0' },
  outlineItem: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', cursor: 'pointer', color: '#64748b', fontSize: '13px' },
  outlineItemActive: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  collapseBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', cursor: 'pointer', color: '#94a3b8', flexShrink: 0 },
  collapsePlaceholder: { width: '16px', height: '16px', flexShrink: 0 },
  outlineText: { whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, flex: 1 },
  childCount: { fontSize: '10px', color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '10px', marginLeft: '4px' },
  statusBar: { display: 'flex', justifyContent: 'space-between', padding: '8px 32px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8' },
  placeholder: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', color: '#94a3b8' },
  placeholderIcon: { marginBottom: '16px', opacity: 0.5 },
  placeholderTitle: { fontSize: '18px', fontWeight: 600, color: '#475569', margin: '0 0 8px' },
  placeholderText: { fontSize: '14px', margin: 0 },
  resizeHandle: { width: '4px', cursor: 'col-resize', backgroundColor: 'transparent', transition: 'background-color 0.15s', flexShrink: 0 },
  resizeHandleActive: { backgroundColor: '#3b82f6' },
  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '360px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', margin: '0 auto 16px', backgroundColor: '#fef2f2', borderRadius: '50%', color: '#ef4444' },
  modalTitle: { fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px', textAlign: 'center' as const },
  modalText: { fontSize: '14px', color: '#64748b', margin: '0 0 24px', textAlign: 'center' as const, lineHeight: 1.5 },
  modalActions: { display: 'flex', gap: '12px' },
  modalCancelBtn: { flex: 1, padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' },
  modalDeleteBtn: { flex: 1, padding: '10px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }
}

export default App
