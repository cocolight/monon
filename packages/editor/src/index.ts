// 导出 Vue 组件（主要使用方式）
export { default as MonacoMarkdownEditor } from './components/MonacoMarkdownEditor.vue'

// 导出核心类和工厂函数（供非 Vue 环境或深度定制使用）
export { MarkdownEditor, createMarkdownEditor } from './core/MarkdownEditor'

// 导出类型（供 TS 项目使用）
export type { MarkdownEditorOptions, MarkdownEditorInstance } from './types'
