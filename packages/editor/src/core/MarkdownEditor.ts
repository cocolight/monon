import * as monaco from 'monaco-editor'
import MarkdownIt from 'markdown-it'

// 导入类型（后续在 types/index.ts 定义）
import type { MarkdownEditorOptions, MarkdownEditorInstance } from '../types'

export class MarkdownEditor {
  // 类内部状态：与原脚本变量对应
  private editor: monaco.editor.IStandaloneCodeEditor | null = null
  private decorationCollection: monaco.editor.IEditorDecorationsCollection | null = null
  private timer: number | null = null
  private md: MarkdownIt = new MarkdownIt()
  // 外部传入的配置和容器
  private container: HTMLElement
  private options: MarkdownEditorOptions

  // 构造函数：接收 DOM 容器和配置
  constructor(container: HTMLElement, options: MarkdownEditorOptions = {}) {
    this.container = container
    // 合并默认配置和用户配置
    this.options = {
      // 默认配置（与原脚本一致）
      initialValue: '# 标题1\n\n## 标题2\n\n**粗体** 和 *斜体*\n\n`代码块` 和 [链接](https://example.com)',
      language: 'markdown',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, Consolas, monospace',
      lineHeight: 24,
      'semanticHighlighting.enabled': false,
      // 覆盖用户传入的配置
      ...options
    }

    // 初始化编辑器（调用内部方法）
    this.initEditor()
    // 初始化装饰器和事件监听
    this.initDecorations()
    this.initEventListeners()
  }

  /** 1. 初始化 Monaco 编辑器实例 */
  private initEditor() {
    this.editor = monaco.editor.create(this.container, this.options)
  }

  /** 2. 初始化装饰器集合 */
  private initDecorations() {
    if (!this.editor) return
    this.decorationCollection = this.editor.createDecorationsCollection()
    // 初始渲染一次装饰器
    this.renderDecorations()
  }

  /** 3. 绑定编辑器事件（内容变化、光标变化） */
  private initEventListeners() {
    if (!this.editor) return
    // 内容变化：防抖触发装饰器渲染
    this.editor.onDidChangeModelContent(() => {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.renderDecorations(), 100) as any
    })

    // 光标变化：可扩展自定义逻辑
    this.editor.onDidChangeCursorPosition(() => {
      this.updateSelectionStyles()
    })
  }

  /** 核心：渲染 Markdown 装饰器 */
  private renderDecorations() {
    const model = this.editor?.getModel()
    if (!model || !this.decorationCollection) return

    const text = model.getValue()
    const tokens = this.md.parse(text, {})
    const newDecos: monaco.editor.IModelDeltaDecoration[] = []

    tokens.forEach((token, index) => {
      switch (token.type) {
        case 'heading_open':
          this.handleHeadingToken(token, newDecos, model)
          break
        case 'strong_open':
          this.handleBoldToken(token, index, newDecos, model)
          break
        case 'code_inline':
          this.handleInlineCodeToken(token, newDecos, model)
          break
      }
    })

    // 批量更新装饰器
    this.decorationCollection.set(newDecos)
  }

  /** 处理标题语法 */
  private handleHeadingToken(
    token: any,
    newDecos: monaco.editor.IModelDeltaDecoration[],
    model: monaco.editor.ITextModel
  ) {
    const headingLevel = parseInt(token.tag.substring(1))
    const headingMap = token.map
    if (!headingMap || headingMap.length < 2) return

    const lineNumber = headingMap[0] + 1
    const lineContent = model.getLineContent(lineNumber)
    const match = lineContent.match(/^#+\s+(.*)$/)
    if (!match || !match[1]) return

    const titleText = match[1]
    const titleStart = lineContent.indexOf(titleText) + 1

    newDecos.push({
      range: new monaco.Range(lineNumber, titleStart, lineNumber, titleStart + titleText.length),
      options: {
        inlineClassName: `md-heading md-heading-${headingLevel}`,
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    })
  }

  /** 处理粗体语法 */
  private handleBoldToken(
    token: any,
    index: number,
    newDecos: monaco.editor.IModelDeltaDecoration[],
    model: monaco.editor.ITextModel
  ) {
    const nextToken = (token as any[])[index + 1]
    if (!nextToken || nextToken.type !== 'text') return

    const lineNumber = this.findTokenLineNumber(model, nextToken)
    if (!lineNumber) return

    const lineContent = model.getLineContent(lineNumber)
    const startPos = lineContent.indexOf(nextToken.content) + 1
    const endPos = startPos + nextToken.content.length

    newDecos.push({
      range: new monaco.Range(lineNumber, startPos, lineNumber, endPos),
      options: { inlineClassName: 'md-bold', stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges }
    })
  }

  /** 处理行内代码语法 */
  private handleInlineCodeToken(
    token: any,
    newDecos: monaco.editor.IModelDeltaDecoration[],
    model: monaco.editor.ITextModel
  ) {
    const lineNumber = this.findTokenLineNumber(model, token)
    if (!lineNumber) return

    const lineContent = model.getLineContent(lineNumber)
    const codeMatch = lineContent.match(/`([^`]+)`/)
    if (!codeMatch || !codeMatch[1]) return

    const startPos = lineContent.indexOf(codeMatch[0]) + 1
    const endPos = startPos + codeMatch[1].length

    newDecos.push({
      range: new monaco.Range(lineNumber, startPos, lineNumber, endPos),
      options: { inlineClassName: 'md-code', stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges }
    })
  }

  /** 辅助：查找 token 对应的行号 */
  private findTokenLineNumber(model: monaco.editor.ITextModel, token: any): number | null {
    if (!token || !token.content) return null

    const text = model.getValue()
    const lines = text.split('\n')

    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.includes(token.content)) {
        return i + 1 // Monaco 行号从 1 开始
      }
    }
    return null
  }

  /** 光标位置变化：原 updateSelectionStyles（可扩展） */
  private updateSelectionStyles() {
    const selection = this.editor?.getSelection()
    if (selection && this.editor) {
      this.editor.setSelection(selection)
    }
  }

  /** 对外暴露：获取 Monaco 原始编辑器实例（方便外部扩展） */
  public getEditorInstance(): monaco.editor.IStandaloneCodeEditor | null {
    return this.editor
  }

  /** 对外暴露：销毁编辑器（防止内存泄漏） */
  public destroy() {
    if (this.timer) clearTimeout(this.timer)
    this.editor?.dispose()
    // this.decorationCollection?.dispose()
    this.editor = null
    this.decorationCollection = null
  }
}

// 对外暴露创建编辑器的工厂函数（简化外部使用）
export function createMarkdownEditor(
  container: HTMLElement,
  options?: MarkdownEditorOptions
): MarkdownEditorInstance {
  const editor = new MarkdownEditor(container, options)
  return {
    instance: editor,
    getMonacoInstance: () => editor.getEditorInstance(),
    destroy: () => editor.destroy()
  }
}