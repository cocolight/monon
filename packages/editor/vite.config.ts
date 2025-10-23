import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm'

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin({
      // 配置 monaco-editor 的 worker
      customDistPath: (relativePath) => `monaco-editor/${relativePath}`,
    })
  ],
  build: {
    rollupOptions: {
      external: [
        // 将 monaco-editor 标记为外部依赖，避免在构建时打包
        'monaco-editor',
        'monaco-editor/esm/vs/editor/editor.worker',
        'monaco-editor/esm/vs/language/json/json.worker',
        'monaco-editor/esm/vs/language/css/css.worker',
        'monaco-editor/esm/vs/language/html/html.worker',
        'monaco-editor/esm/vs/language/typescript/ts.worker',
      ]
    }
  }
})