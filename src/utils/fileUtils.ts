import { v4 as uuidv4 } from 'uuid'
import { Note, Folder, Attachment } from '../types'

// 生成唯一ID
export const generateId = (): string => uuidv4()

// 创建新笔记
export const createNote = (folderId: string | null = null): Note => {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: '无标题笔记',
    content: '',
    folderId,
    tags: [],
    isFavorite: false,
    isPinned: false,
    attachments: [],
    metadata: {
      wordCount: 0,
      readingTime: 0
    },
    createdAt: now,
    updatedAt: now
  }
}

// 创建新文件夹
export const createFolder = (name: string, parentId: string | null = null): Folder => {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name,
    parentId,
    icon: 'folder',
    color: '#3b82f6',
    noteCount: 0,
    createdAt: now,
    updatedAt: now
  }
}

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }

  // 其他情况
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算字数
export const countWords = (text: string): number => {
  // 移除HTML标签
  const cleanText = text.replace(/<[^>]*>/g, '')
  // 移除空白字符
  const trimmedText = cleanText.trim()
  if (!trimmedText) return 0

  // 中文字符计数
  const chineseChars = trimmedText.match(/[\u4e00-\u9fa5]/g)?.length || 0
  // 英文单词计数
  const englishWords = trimmedText
    .replace(/[\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return chineseChars + englishWords
}

// 计算阅读时间（分钟）
export const calculateReadingTime = (wordCount: number): number => {
  // 平均阅读速度：每分钟200字
  return Math.max(1, Math.ceil(wordCount / 200))
}

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 提取纯文本（移除Markdown标记）
export const extractPlainText = (markdown: string): string => {
  return markdown
    .replace(/#{1,6}\s/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/~~(.*?)~~/g, '$1') // 移除删除线
    .replace(/`{3}[\s\S]*?`{3}/g, '') // 移除代码块
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // 移除图片
    .replace(/[\r\n]+/g, ' ') // 移除换行
    .trim()
}

// 防抖函数
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 高亮搜索关键词
export const highlightText = (text: string, query: string): string => {
  if (!query) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// 获取MIME类型
export const getMimeType = (filename: string): string => {
  const ext = getFileExtension(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  return mimeTypes[ext] || 'application/octet-stream'
}
