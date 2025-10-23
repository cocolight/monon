import * as monaco from 'monaco-editor'
import { MarkdownEditor } from '../core/MarkdownEditor'

/** 编辑器初始化配置：继承 Monaco 配置，扩展自定义字段 */
export interface MarkdownEditorOptions extends monaco.editor.IStandaloneEditorConstructionOptions {
  /** 编辑器初始内容（默认有默认值） */
  initialValue?: string
}

/** 对外暴露的编辑器实例对象：包含核心类和操作方法 */
export interface MarkdownEditorInstance {
  /** 核心编辑器类实例 */
  instance: MarkdownEditor
  /** 获取 Monaco 原始实例（用于外部调用 Monaco 原生 API） */
  getMonacoInstance: () => monaco.editor.IStandaloneCodeEditor | null
  /** 销毁编辑器（防止内存泄漏） */
  destroy: () => void
}