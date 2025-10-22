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
    value: '# Hello Monaco\n\n**Bold** and `code`',
    language: 'markdown',
    lineNumbers: 'off',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    fontSize: 14,
  })

  // 首次渲染 + 输入防抖
  renderDecorations()
  editor.onDidChangeModelContent(() => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(renderDecorations, 150) as any
  })
})

function renderDecorations() {
  const model = editor.getModel()!
  const text = model.getValue()
  const tokens = md.parse(text, {})
  const newDecos: monaco.editor.IModelDeltaDecoration[] = []

  // 存储当前处理的token信息
  let currentToken: any = null

  for (const tok of tokens) {
    if (tok.type === 'heading_open') {
      currentToken = { type: 'heading', level: tok.tag.substr(1), map: tok.map }
    }
    else if (tok.type === 'heading_close') {
      if (currentToken && currentToken.type === 'heading') {
        const [startLine, endLine] = currentToken.map
        const lineContent = model.getLineContent(startLine + 1)

        // 只装饰标题文本部分（去掉#号和空格）
        const titleText = lineContent.replace(/^#+\s*/, '')
        const titleStart = lineContent.indexOf(titleText) + 1

        newDecos.push({
          range: new monaco.Range(
            startLine + 1,
            titleStart,
            startLine + 1,
            titleStart + titleText.length
          ),
          options: { inlineClassName: `md-heading md-heading-${currentToken.level}` }
        })
      }
      currentToken = null
    }
    else if (tok.type === 'strong_open') {
      currentToken = { type: 'strong', map: tok.map, content: '' }
    }
    else if (tok.type === 'strong_close') {
      if (currentToken && currentToken.type === 'strong') {
        const [startLine, endLine] = currentToken.map
        const lineContent = model.getLineContent(startLine + 1)

        // 找到**之间的文本
        const strongStart = lineContent.indexOf('**') + 2
        const strongEnd = lineContent.lastIndexOf('**')
        const strongText = lineContent.substring(strongStart, strongEnd)

        newDecos.push({
          range: new monaco.Range(
            startLine + 1,
            strongStart + 1,
            startLine + 1,
            strongStart + strongText.length + 1
          ),
          options: { inlineClassName: 'md-strong' }
        })
      }
      currentToken = null
    }
    else if (currentToken && currentToken.type === 'strong' && tok.type === 'text') {
      currentToken.content += tok.content
    }
  }

  // 更新装饰
  decos = editor.deltaDecorations(decos, newDecos)
}
</script>

<style scoped>
:deep(.md-heading-1) {
  font-size: 1.8em !important;
  color: #0969da;
  font-weight: 600;
  display: inline-block;
}

:deep(.md-heading-2) {
  font-size: 1.5em !important;
  color: #0969da;
  font-weight: 600;
  display: inline-block;
}

:deep(.md-heading-3) {
  font-size: 1.3em !important;
  color: #0969da;
  font-weight: 600;
  display: inline-block;
}

:deep(.md-strong) {
  font-weight: bold !important;
  color: #24292f;
  display: inline-block;
}

/* 修复Monaco编辑器布局 */
:deep(.monaco-editor) {
  text-align: left !important;
}

:deep(.view-line) {
  text-align: left !important;
}

:deep(.mtk1) {
  text-align: left !important;
}
</style>
