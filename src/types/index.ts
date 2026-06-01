// 笔记数据结构
export interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  tags: string[]
  isFavorite: boolean
  isPinned: boolean
  attachments: Attachment[]
  metadata: NoteMetadata
  createdAt: string
  updatedAt: string
}

// 笔记元数据
export interface NoteMetadata {
  wordCount: number
  readingTime: number
  lastCursorPosition?: number
}

// 文件夹结构
export interface Folder {
  id: string
  name: string
  parentId: string | null
  icon: string
  color: string
  noteCount: number
  createdAt: string
  updatedAt: string
}

// 附件
export interface Attachment {
  id: string
  filename: string
  path: string
  size: number
  mimeType: string
  createdAt: string
}

// 版本历史
export interface Version {
  id: string
  noteId: string
  content: string
  createdAt: string
  description: string
}

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  fontFamily: string
  autoSave: boolean
  autoSaveInterval: number
  showLineNumbers: boolean
  defaultNoteFormat: 'markdown' | 'richtext'
  storagePath: string
}

// 搜索结果
export interface SearchResult {
  noteId: string
  title: string
  content: string
  matchCount: number
  matches: SearchMatch[]
}

// 搜索匹配
export interface SearchMatch {
  line: number
  column: number
  text: string
}

// 排序选项
export type SortBy = 'updatedAt' | 'createdAt' | 'title'
export type SortOrder = 'asc' | 'desc'

// 视图模式
export type ViewMode = 'list' | 'grid' | 'compact'

// 侧边栏项目
export interface SidebarItem {
  id: string
  label: string
  icon: string
  type: 'folder' | 'tag' | 'smart'
  count?: number
}
