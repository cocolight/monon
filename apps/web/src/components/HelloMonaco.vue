<template>
  <div ref="editorContainer" :style="{ width: width, height: height, ...containerStyle }"></div>
</template>

<script setup lang="ts">
import { createEditor } from '@monon/editor'
import type { EditorOptions, EditorInstance } from '@monon/editor'
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  width?: string
  height?: string
  containerStyle?: Record<string, string>
  editorOptions?: EditorOptions
  fontSize?: number
  lineHeight?: number
  fontFamily?: string
}>(), {
  width: '100%',
  height: '100%',
  containerStyle: () => ({}),
  editorOptions: () => ({}),
  fontSize: 14,
  lineHeight: 24,
  fontFamily: "'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace"
})

const editorContainer = ref<HTMLElement>()
const editorInstance = ref<EditorInstance>()

// 监听字体和行高变化
watch([() => props.fontSize, () => props.lineHeight, () => props.fontFamily], () => {
  if (editorInstance.value) {
    editorInstance.value.updateOptions({
      fontSize: props.fontSize,
      lineHeight: props.lineHeight,
      fontFamily: props.fontFamily
    })
  }
})

onMounted(() => {
  if (!editorContainer.value) return
  editorInstance.value = createEditor(editorContainer.value, {
    ...props.editorOptions,
    fontSize: props.fontSize,
    lineHeight: props.lineHeight,
    fontFamily: props.fontFamily
  })
})

onUnmounted(() => {
  editorInstance.value?.dispose()
})

defineExpose({
  getEditorInstance: () => editorInstance.value?.getMonacoInstance(),
  destroyEditor: () => editorInstance.value?.dispose(),
  updateOptions: (options: any) => editorInstance.value?.updateOptions(options)
})
</script>

<style scoped lang="scss">
/* 确保 Monaco 编辑器容器样式 */
:deep(.monaco-editor) {
  text-align: left !important;

  /* 全局字体设置 */
  .monaco-editor {
    font-family: v-bind('props.fontFamily') !important;
    font-size: v-bind('props.fontSize + "px"') !important;
  }

  /* 统一行高和字体高度 */
  .view-lines {
    line-height: v-bind('props.lineHeight + "px"') !important;
  }

  .view-line {
    min-height: v-bind('props.lineHeight + "px"') !important;
    height: v-bind('props.lineHeight + "px"') !important;
    line-height: v-bind('props.lineHeight + "px"') !important;
    display: flex !important;
    align-items: center !important;

    > span {
      display: inline !important;
      vertical-align: middle !important;
      line-height: inherit !important;
      height: v-bind('props.lineHeight + "px"') !important;
    }
  }

  /* 光标和选择区域高度 */
  .cursors-layer .cursor,
  .selected-text {
    height: v-bind('props.lineHeight + "px"') !important;
    line-height: v-bind('props.lineHeight + "px"') !important;
  }

  /* 装饰器元素统一高度 */
  [class^="md-"] {
    height: v-bind('props.lineHeight + "px"') !important;
    line-height: v-bind('props.lineHeight + "px"') !important;
    vertical-align: middle !important;
  }

  /* 代码块特殊处理 */
  :deep(.monaco-editor .view-line .md-code) {
    height: calc(v-bind('props.lineHeight + "px"') - 4px) !important;
    line-height: calc(v-bind('props.lineHeight + "px"') - 4px) !important;
    margin: 2px 0 !important;
    vertical-align: middle !important;
  }
}

/* 标题样式调整 */
:deep(.monaco-editor .view-line .md-heading-1) {
  font-size: calc(v-bind('props.fontSize + "px"') * 1.8) !important;
  height: v-bind('props.lineHeight + "px"') !important;
  line-height: v-bind('props.lineHeight + "px"') !important;
}

:deep(.monaco-editor .view-line .md-heading-2) {
  font-size: calc(v-bind('props.fontSize + "px"') * 1.5) !important;
  height: v-bind('props.lineHeight + "px"') !important;
  line-height: v-bind('props.lineHeight + "px"') !important;
}

:deep(.monaco-editor .view-line .md-heading-3) {
  font-size: calc(v-bind('props.fontSize + "px"') * 1.3) !important;
  height: v-bind('props.lineHeight + "px"') !important;
  line-height: v-bind('props.lineHeight + "px"') !important;
}
</style>
