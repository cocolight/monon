import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';

export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin({
      // 打包地址
      customDistPath: () => resolve(__dirname, '../dist/monaco-editor/'),
      // 路由前缀
      publicPath: 'monaco-editor',
    })
  ],
  optimizeDeps: {
    include: [
      `monaco-editor/esm/vs/language/json/json.worker`,
      `monaco-editor/esm/vs/language/css/css.worker`,
      `monaco-editor/esm/vs/language/html/html.worker`,
      `monaco-editor/esm/vs/language/typescript/ts.worker`,
      `monaco-editor/esm/vs/editor/editor.worker`
    ],
  },
});