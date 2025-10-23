import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm'

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      // 开发阶段只保留这一句即可
      languageWorkers: ['editorWorkerService']
      // publicPath / customDistPath 先删掉
    })
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
})