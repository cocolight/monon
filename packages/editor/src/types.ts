import * as monaco from 'monaco-editor';

export interface EditorOptions {
  language?: string;
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  readOnly?: boolean;
  wordWrap?: 'on' | 'off';
  minimap?: boolean;
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
}

export interface EditorInstance {
  dispose: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'vs' | 'vs-dark' | 'hc-black') => void;
  getMonacoInstance: () => any;
  getDecorationCollection: () => any;
  updateOptions: (option: monaco.editor.IEditorOptions) => void;
}