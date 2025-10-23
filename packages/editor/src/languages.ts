import * as monaco from 'monaco-editor';

// 注册 Markdown 基础补全
monaco.languages.registerCompletionItemProvider('markdown', {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    return {
      suggestions: [
        {
          label: '```',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '```${1:language}\n${2:# code}\n```',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Code block',
          range: range
        },
        {
          label: '**bold**',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '**${1:text}**',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Bold text',
          range: range
        }
      ]
    };
  }
});

// 按需注册 Python/JS 高亮（异步，Week2 再拆）
import 'monaco-editor/esm/vs/language/python/python.contribution';
import 'monaco-editor/esm/vs/language/javascript/javascript.contribution';