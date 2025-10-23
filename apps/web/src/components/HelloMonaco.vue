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
    lineHeight: 24,
    'semanticHighlighting.enabled': false
  })

  renderDecorations()
  editor.onDidChangeModelContent(() => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(renderDecorations, 100) as any
  })

  editor.onDidChangeCursorPosition(() => {
    updateSelectionStyles()
  })
})

function renderDecorations() {
  const model = editor.getModel()!
  const text = model.getValue()
  const tokens = md.parse(text, {})
  const newDecos: monaco.editor.IModelDeltaDecoration[] = []

  tokens.forEach((token, index) => {
    switch (token.type) {
      case 'heading_open':
        const headingLevel = parseInt(token.tag.substring(1))
        const headingMap = token.map!

        if (headingMap && headingMap.length >= 2) {
          const lineNumber = headingMap[0] + 1
          const lineContent = model.getLineContent(lineNumber)

          const match = lineContent.match(/^#+\s+(.*)$/)
          if (match && match[1]) {
            const titleText = match[1]
            const titleStart = lineContent.indexOf(titleText) + 1

            newDecos.push({
              range: new monaco.Range(
                lineNumber,
                titleStart,
                lineNumber,
                titleStart + titleText.length
              ),
              options: {
                inlineClassName: `md-heading md-heading-${headingLevel}`,
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
              }
            })
          }
        }
        break

      case 'strong_open':
        const nextToken = tokens[index + 1]
        if (nextToken && nextToken.type === 'text') {
          const lineNumber = findTokenLineNumber(model, nextToken)
          if (lineNumber) {
            const lineContent = model.getLineContent(lineNumber)
            const startPos = lineContent.indexOf(nextToken.content) + 1
            const endPos = startPos + nextToken.content.length

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

      case 'code_inline':
        const codeLineNumber = findTokenLineNumber(model, token)
        if (codeLineNumber) {
          const lineContent = model.getLineContent(codeLineNumber)
          const codeMatch = lineContent.match(/`([^`]+)`/)
          if (codeMatch) {
            const startPos = lineContent.indexOf(codeMatch[0]) + 1
            const endPos = startPos + codeMatch[1].length

            newDecos.push({
              range: new monaco.Range(codeLineNumber, startPos, codeLineNumber, endPos),
              options: {
                inlineClassName: 'md-code',
                stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
              }
            })
          }
        }
        break
    }
  })

  decos = editor.deltaDecorations(decos, newDecos)
  updateSelectionStyles()
}

function updateSelectionStyles() {
  const selection = editor.getSelection()
  if (selection) {
    editor.setSelection(selection)
  }
}

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
/* 基础编辑器样式重置 */
:deep(.monaco-editor) {
  text-align: left !important;
}

:deep(.view-line) {
  min-height: 24px !important;
  display: flex !important;
  align-items: flex-end !important;
  line-height: 24px !important;
}

:deep(.view-line > span) {
  display: inline !important;
  vertical-align: bottom !important;
  line-height: inherit !important;
}

/* 标题样式 */
:deep(.md-heading-1) {
  font-size: 1.8em !important;
  font-weight: 700 !important;
  color: #d32f2f !important;
  display: inline !important;
  line-height: 1.2 !important;
  vertical-align: bottom !important;
  padding-bottom: 2px !important;
  margin: 0 !important;
}

:deep(.md-heading-2) {
  font-size: 1.5em !important;
  font-weight: 600 !important;
  color: #1976d2 !important;
  display: inline !important;
  line-height: 1.2 !important;
  vertical-align: bottom !important;
  padding-bottom: 1px !important;
  margin: 0 !important;
}

:deep(.md-heading-3) {
  font-size: 1.3em !important;
  font-weight: 600 !important;
  color: #388e3c !important;
  display: inline !important;
  line-height: 1.2 !important;
  vertical-align: bottom !important;
  padding-bottom: 1px !important;
  margin: 0 !important;
}

/* 粗体样式 */
:deep(.md-bold) {
  font-weight: 700 !important;
  color: #5d4037 !important;
  display: inline !important;
  vertical-align: bottom !important;
  line-height: inherit !important;
}

/* 代码样式 */
:deep(.md-code) {
  background-color: #f5f5f5 !important;
  color: #d81b60 !important;
  font-family: monospace !important;
  padding: 1px 4px 2px 4px !important;
  border-radius: 3px !important;
  display: inline !important;
  vertical-align: bottom !important;
  line-height: 18px !important;
  height: 20px !important;
  margin: 0 1px !important;
}

/* 选择区域样式 */
:deep(.monaco-editor .view-lines .selected-text) {
  background-color: rgba(173, 214, 255, 0.3) !important;
  vertical-align: bottom !important;
  line-height: inherit !important;
}

:deep(.monaco-editor .view-lines .selectionHighlight) {
  background-color: rgba(173, 214, 255, 0.3) !important;
  vertical-align: bottom !important;
}

/* 光标样式 - 移除所有可能影响定位的样式 */
:deep(.monaco-editor .cursors-layer .cursor) {
  height: 20px !important;
  /* 移除所有固定定位属性，让Monaco Editor自己管理 */
}

/* 确保所有装饰元素正确对齐 */
:deep(.view-line [class^="md-"]) {
  vertical-align: bottom !important;
  line-height: inherit !important;
}

:deep(.mtk1) {
  color: #000000 !important;
  vertical-align: bottom !important;
  line-height: inherit !important;
}
</style>

<style>
/* 全局样式覆盖 */
.monaco-editor .view-line .selected-text {
  background-color: rgba(173, 214, 255, 0.3) !important;
  vertical-align: bottom !important;
  line-height: inherit !important;
}

.monaco-editor .view-line .selectionHighlight {
  background-color: rgba(173, 214, 255, 0.3) !important;
  vertical-align: bottom !important;
}
</style>
