import { useState, useEffect } from 'react'
import {
  X,
  Moon,
  Sun,
  Monitor,
  Type,
  Save,
  FolderOpen,
  Keyboard,
  Info,
  Check
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { AppSettings } from '../../types'
import { clsx } from 'clsx'

export const Settings = () => {
  const { settings, setSettings, toggleSettings } = useAppStore()

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'shortcuts' | 'about'>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 保存设置
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await window.electronAPI.saveSettings(localSettings)
      setSettings(localSettings)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('保存设置失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 应用主题
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = localSettings
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', isDark)
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }
    applyTheme()
  }, [localSettings.theme])

  // 标签页配置
  const tabs = [
    { id: 'general', label: '通用', icon: <Monitor size={16} /> },
    { id: 'editor', label: '编辑器', icon: <Type size={16} /> },
    { id: 'shortcuts', label: '快捷键', icon: <Keyboard size={16} /> },
    { id: 'about', label: '关于', icon: <Info size={16} /> }
  ]

  // 主题选项
  const themeOptions = [
    { value: 'light', label: '浅色', icon: <Sun size={16} /> },
    { value: 'dark', label: '深色', icon: <Moon size={16} /> },
    { value: 'system', label: '跟随系统', icon: <Monitor size={16} /> }
  ]

  // 字体选项
  const fontOptions = [
    { value: 'system-ui', label: '系统默认' },
    { value: 'serif', label: '衬线字体' },
    { value: 'monospace', label: '等宽字体' }
  ]

  // 快捷键列表
  const shortcuts = [
    { category: '文件操作', items: [
      { key: 'Ctrl + N', description: '新建笔记' },
      { key: 'Ctrl + S', description: '保存笔记' },
      { key: 'Ctrl + E', description: '导出笔记' },
      { key: 'Ctrl + I', description: '导入文件' }
    ]},
    { category: '编辑操作', items: [
      { key: 'Ctrl + Z', description: '撤销' },
      { key: 'Ctrl + Y', description: '重做' },
      { key: 'Ctrl + B', description: '加粗' },
      { key: 'Ctrl + I', description: '斜体' },
      { key: 'Ctrl + U', description: '下划线' },
      { key: 'Ctrl + Shift + H', description: '高亮' },
      { key: 'Ctrl + K', description: '插入链接' }
    ]},
    { category: '视图操作', items: [
      { key: 'Ctrl + K', description: '搜索笔记' },
      { key: 'Ctrl + ,', description: '打开设置' },
      { key: 'Ctrl + B', description: '切换侧边栏' },
      { key: 'Ctrl + Shift + L', description: '切换笔记列表' }
    ]}
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleSettings
        }
      />

      {/* 设置面板 */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">设置</h2>
          <button
            onClick={toggleSettings}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 侧边标签 */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 通用设置 */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* 主题设置 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">主题</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, theme: option.value as AppSettings['theme'] })}
                        className={clsx(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                          localSettings.theme === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        {option.icon}
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 自动保存 */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">自动保存</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        自动保存笔记更改
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.autoSave}
                        onChange={(e) => setLocalSettings({ ...localSettings, autoSave: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {localSettings.autoSave && (
                    <div className="mt-3">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        自动保存间隔（毫秒）
                      </label>
                      <input
                        type="number"
                        value={localSettings.autoSaveInterval}
                        onChange={(e) => setLocalSettings({ ...localSettings, autoSaveInterval: parseInt(e.target.value) || 30000 })}
                        min={5000}
                        max={300000}
                        step={5000}
                        className="mt-1 w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>

                {/* 存储路径 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">存储路径</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={localSettings.storagePath}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none"
                    />
                    <button className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                      <FolderOpen size={16} />
                      <span>打开文件夹</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 编辑器设置 */}
            {activeTab === 'editor' && (
              <div className="space-y-6">
                {/* 字体大小 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">字体大小</h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={12}
                      max={24}
                      value={localSettings.fontSize}
                      onChange={(e) => setLocalSettings({ ...localSettings, fontSize: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {localSettings.fontSize}px
                    </span>
                  </div>
                </div>

                {/* 字体样式 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">字体样式</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {fontOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLocalSettings({ ...localSettings, fontFamily: option.value })}
                        className={clsx(
                          'px-4 py-3 text-sm rounded-lg border-2 transition-colors',
                          localSettings.fontFamily === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                        style={{ fontFamily: option.value }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 显示行号 */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">显示行号</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      在代码块中显示行号
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showLineNumbers}
                      onChange={(e) => setLocalSettings({ ...localSettings, showLineNumbers: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* 默认笔记格式 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">默认笔记格式</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLocalSettings({ ...localSettings, defaultNoteFormat: 'markdown' })}
                      className={clsx(
                        'px-4 py-3 text-sm rounded-lg border-2 transition-colors',
                        localSettings.defaultNoteFormat === 'markdown'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      Markdown
                    </button>
                    <button
                      onClick={() => setLocalSettings({ ...localSettings, defaultNoteFormat: 'richtext' })}
                      className={clsx(
                        'px-4 py-3 text-sm rounded-lg border-2 transition-colors',
                        localSettings.defaultNoteFormat === 'richtext'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                    >
                      富文本
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 快捷键设置 */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                {shortcuts.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map((shortcut) => (
                        <div
                          key={shortcut.key}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <kbd className="text-xs font-mono bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-500">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 关于 */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">笔记软件</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">版本 1.0.0</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">技术栈</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Electron - 跨平台桌面应用框架</li>
                    <li>• React - 用户界面库</li>
                    <li>• TypeScript - 类型安全</li>
                    <li>• TipTap - 富文本编辑器</li>
                    <li>• Tailwind CSS - 样式框架</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">功能特性</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 富文本编辑和Markdown支持</li>
                    <li>• 文件夹和标签管理</li>
                    <li>• 全局搜索</li>
                    <li>• 本地文件系统存储</li>
                    <li>• 多主题支持</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {saveSuccess && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check size={14} />
              保存成功
            </span>
          )}
          <button
            onClick={toggleSettings}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save size={14} />
            <span>{isSaving ? '保存中...' : '保存设置'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
