<template>
    <!-- 编辑器挂载容器：宽高由外部传入或默认 -->
    <div ref="editorContainer" :style="{ width: width, height: height, ...containerStyle }"></div>
</template>

<script setup lang="ts">
    // 导入全局样式（Vite 会自动处理，无需导出）
    import '../styles/editor-global.css'
    import { onMounted, onUnmounted, ref, defineProps, withDefaults } from 'vue'
    import { createMarkdownEditor } from '../core/MarkdownEditor'
    import type { MarkdownEditorOptions, MarkdownEditorInstance } from '../types'

    /** 1. 定义外部可传入的 props（配置和样式） */
    const props = withDefaults(
        defineProps<{
            /** 编辑器宽度（默认 100%） */
            width?: string
            /** 编辑器高度（默认 600px） */
            height?: string
            /** 容器额外样式（支持外部覆盖） */
            containerStyle?: Record<string, string>
            /** 编辑器核心配置（覆盖默认值） */
            editorOptions?: MarkdownEditorOptions
        }>(),
        {
            width: '100%',
            height: '600px',
            containerStyle: () => ({}),
            editorOptions: () => ({})
        }
    )

    /** 2. 内部状态：容器 ref + 编辑器实例 */
    const editorContainer = ref<HTMLElement | null>(null)
    const editorInstance = ref<MarkdownEditorInstance | null>(null)

    /** 3. 生命周期：挂载时创建编辑器 */
    onMounted(() => {
        if (!editorContainer.value) return
        // 调用工厂函数创建编辑器
        editorInstance.value = createMarkdownEditor(editorContainer.value, props.editorOptions)
    })

    /** 4. 生命周期：卸载时销毁编辑器（防止内存泄漏） */
    onUnmounted(() => {
        editorInstance.value?.destroy()
    })

    /** 5. 对外暴露：让父组件能获取编辑器实例（可选） */
    defineExpose({
        getEditorInstance: () => editorInstance.value?.getMonacoInstance(),
        destroyEditor: () => editorInstance.value?.destroy()
    })
</script>

<style scoped lang="scss">

    /* 若有组件内基础样式，可在此定义（如重置容器默认样式） */
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

    /* 选择区域样式（带 :deep() 的部分） */
    :deep(.monaco-editor .view-lines .selected-text) {
        background-color: rgba(173, 214, 255, 0.3) !important;
        vertical-align: bottom !important;
        line-height: inherit !important;
    }

    :deep(.monaco-editor .view-lines .selectionHighlight) {
        background-color: rgba(173, 214, 255, 0.3) !important;
        vertical-align: bottom !important;
    }

    /* 光标样式 */
    :deep(.monaco-editor .cursors-layer .cursor) {
        height: 20px !important;
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