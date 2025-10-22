<template>
  <div ref="editorEl" style="height: 600px; width: 100%;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const editorEl = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor
let decos: string[] = []
let timer: number | null = null

onMounted(() => {
  editor = monaco.editor.create(editorEl.value!, {
    value: '# 标题1\n\n## 标题2\n\n**粗体** 和 *斜体*\n\n`代码块` 和 [链接](https://example.com)',
    language: 'markdown',
    lineNumbers: 'off',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, Consolas, monospace',
    // 禁用Monaco的语法高亮，使用自定义装饰器
    'semanticHighlighting.enabled': false
  })

  renderDecorations()
  editor.onDidChangeModelContent(() => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(renderDecorations, 100) as any
  })
})

function renderDecorations() {
  const model = editor.getModel()!
  const text = model.getValue()
  const tokens = md.parse(text, {})
  const newDecos: monaco.editor.IModelDeltaDecoration[] = []

  let inHeading = false
  let inBold = false
  let inItalic = false
  let inCode = false
  let inLink = false

  tokens.forEach((token, index) => {
    const nextToken = tokens[index + 1]

    switch (token.type) {
      // 标题处理
      case 'heading_open':
        inHeading = true
        const headingLevel = parseInt(token.tag.substring(1))
        const headingMap = token.map!

        // 获取标题行内容
        const headingLine = model.getLineContent(headingMap[0] + 1)
        // 找到标题文本开始位置（跳过#号和空格）
        const titleStart = headingLine.search(/[^#\s]/) + 1

        if (titleStart > 0) {
          newDecos.push({
            range: new monaco.Range(
              headingMap[0] + 1,
              titleStart,
              headingMap[0] + 1,
              headingLine.length + 1
            ),
            options: {
              inlineClassName: `md-heading md-heading-${headingLevel}`,
              // 保持原有文本，只添加样式
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
          })
        }
        break

      case 'heading_close':
        inHeading = false
        break

      // 粗体处理
      case 'strong_open':
        inBold = true
        break

      case 'strong_close':
        inBold = false
        break

      case 'text':
        if (inBold && token.content) {
          // 找到粗体文本的位置
          const lineNumber = findTokenLineNumber(model, token)
          if (lineNumber) {
            const lineContent = model.getLineContent(lineNumber)
            const startPos = lineContent.indexOf(token.content) + 1
            const endPos = startPos + token.content.length

            newDecos.push({
              range: new monaco.Range(lineNumber, startPos, lineNumber, endPos),
              options: {
                inlineClassName: 'md-bold',
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
              }
            })
          }
        }
        break

      // 斜体处理
      case 'em_open':
        inItalic = true
        break

      case 'em_close':
        inItalic = false
        break

      // 代码处理
      case 'code_inline':
        const codeLineNumber = findTokenLineNumber(model, token)
        if (codeLineNumber) {
          const lineContent = model.getLineContent(codeLineNumber)
          const startPos = lineContent.indexOf('`' + token.content + '`') + 2
          const endPos = startPos + token.content.length - 1

          newDecos.push({
            range: new monaco.Range(codeLineNumber, startPos, codeLineNumber, endPos),
            options: {
              inlineClassName: 'md-code',
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
          })
        }
        break

      // 链接处理
      case 'link_open':
        inLink = true
        break

      case 'link_close':
        inLink = false
        break
    }
  })

  // 更新装饰器
  decos = editor.deltaDecorations(decos, newDecos)
}

// 辅助函数：根据token内容找到所在行号
function findTokenLineNumber(model: monaco.editor.ITextModel, token: any): number | null {
  const text = model.getValue()
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(token.content)) {
      return i + 1
    }
  }
  return null
}
</script>

<style scoped>
/* 标题样式 */
:deep(.md-heading-1) {
  font-size: 1.8em !important;
  font-weight: 700 !important;
  color: #d32f2f !important;
  display: inline !important;
}

:deep(.md-heading-2) {
  font-size: 1.5em !important;
  font-weight: 600 !important;
  color: #1976d2 !important;
  display: inline !important;
}

:deep(.md-heading-3) {
  font-size: 1.3em !important;
  font-weight: 600 !important;
  color: #388e3c !important;
  display: inline !important;
}

/* 粗体样式 */
:deep(.md-bold) {
  font-weight: 700 !important;
  color: #5d4037 !important;
  display: inline !important;
}

/* 代码样式 */
:deep(.md-code) {
  background-color: #f5f5f5 !important;
  color: #d81b60 !important;
  font-family: monospace !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  display: inline !important;
}

/* 确保编辑器正常显示 */
:deep(.monaco-editor) {
  text-align: left !important;
}

:deep(.view-line) {
  text-align: left !important;
}

:deep(.mtk1) {
  color: #000000 !important; /* 普通文本颜色 */
}
</style>
