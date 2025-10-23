import * as monaco from 'monaco-editor'
export function createEditor(container: HTMLElement) {
  return monaco.editor.create(container, { value: '// editor ready', language: 'javascript' })
}