import * as monaco from 'monaco-editor';
import MarkdownIt from 'markdown-it';
import { createWorkerUrl } from './worker';
import { EditorOptions, EditorInstance } from './types';

export function createEditor(
  container: HTMLElement,
  opts: EditorOptions = {}
): EditorInstance {
  // ① 环境一次注入
  self.MonacoEnvironment = { getWorker: (_, label) => createWorkerUrl(_, label) };
  const md = new MarkdownIt();

  // 注册markdown片段（代码快捷输入）

  // 创建 Monaco 实例
  const editor = monaco.editor.create(container, {
    value: '# 标题1\n\n## 标题2\n\n`root`\n\n[baidu ](https://www.baidu.com)\n\n**加粗**\n\n*斜体*',
    language: opts.language ?? 'markdown',
    theme: opts.theme ?? 'vs',
    readOnly: opts.readOnly ?? false,
    wordWrap: opts.wordWrap ?? 'on',
    minimap: { enabled: opts.minimap ?? false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',

    // 新增字体和行高配置
    fontSize: opts.fontSize ?? 14,
    lineHeight: opts.lineHeight ?? 24,
    fontFamily: opts.fontFamily ?? "'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace",

    // 确保一致的渲染
    letterSpacing: 0.5, // 轻微字间距，提高可读性
    fontLigatures: false, // 禁用连字，确保一致性
    renderLineHighlight: 'all', // 高亮当前行
    lineDecorationsWidth: 10, // 行号区域宽度
  });

  // 装饰集合 & 防抖
  const decorationCollection = editor.createDecorationsCollection();
  let timer: ReturnType<typeof setTimeout> | null = null;

  /**
   * 渲染文档的装饰效果
   *
   * 该函数解析当前编辑器中的 Markdown 内容，并为不同类型的元素添加样式装饰：
   * - 标题（h1-h6）：添加对应级别的标题样式
   * - 粗体文本：添加粗体样式
   * - 行内代码：添加代码样式
   *
   * 解析后的装饰会应用到编辑器中，提供所见即所得的视觉效果
   */
  // 修改 renderDecorations 函数中的装饰器选项
  const renderDecorations = () => {
    const model = editor.getModel();
    if (!model) return;

    const text = model.getValue();
    const tokens = md.parse(text, {});
    const newDecos: monaco.editor.IModelDeltaDecoration[] = [];

    // 调试：打印 tokens 查看结构
    console.log('Tokens:', tokens);

    tokens.forEach((tok, i) => {
      // 处理标题标记 - 更精确的检测
      if (tok.type.startsWith('heading')) {
        const lineNumber = (tok.map?.[0] ?? 0) + 1;
        const lineContent = model.getLineContent(lineNumber);

        // 使用正则匹配标题
        const headingMatch = lineContent.match(/^(#{1,6})\s+(.+)$/);

        if (headingMatch) {
          const headingLevel = headingMatch[1].length;
          const headingText = headingMatch[2];
          const prefixLength = headingMatch[1].length + 1; // #号数量 + 空格

          if (headingText.length > 0) {
            newDecos.push({
              range: new monaco.Range(
                lineNumber,
                prefixLength + 1, // 从标题文本开始
                lineNumber,
                prefixLength + headingText.length + 1
              ),
              options: {
                inlineClassName: `md-heading-${headingLevel}`,
                // 添加更多调试信息
                hoverMessage: { value: `标题 ${headingLevel}: ${headingText}` },
                zIndex: 20
              }
            });

            console.log(`标题 ${headingLevel}: "${headingText}" at line ${lineNumber}, range ${prefixLength + 1}-${prefixLength + headingText.length + 1}`);
          }
        }
      }

      // 处理粗体文本 - 简化方法
      if (tok.type === 'strong_open' && tokens[i + 1]?.type === 'text') {
        const textToken = tokens[i + 1];
        const lineNumber = (textToken.map?.[0] ?? 0) + 1;
        const content = textToken.content;

        // 查找粗体内容在行中的位置
        const lineContent = model.getLineContent(lineNumber);
        const boldStart = lineContent.indexOf(content);

        if (boldStart >= 0 && content.length > 0) {
          newDecos.push({
            range: new monaco.Range(
              lineNumber,
              boldStart + 1,
              lineNumber,
              boldStart + content.length + 1
            ),
            options: {
              inlineClassName: 'md-bold',
              zIndex: 10
            }
          });
        }
      }

      // 处理行内代码 - 简化方法
      if (tok.type === 'code_inline') {
        const lineNumber = (tok.map?.[0] ?? 0) + 1;
        const content = tok.content;

        // 查找代码内容在行中的位置
        const lineContent = model.getLineContent(lineNumber);
        const codeStart = lineContent.indexOf('`' + content + '`');

        if (codeStart >= 0 && content.length > 0) {
          newDecos.push({
            range: new monaco.Range(
              lineNumber,
              codeStart + 2, // 跳过第一个 `
              lineNumber,
              codeStart + content.length + 2
            ),
            options: {
              inlineClassName: 'md-code',
              zIndex: 10
            }
          });
        }
      }
    });

    // 调试：打印装饰器信息
    console.log('Decorations:', newDecos);

    // 清除旧装饰器并设置新装饰器
    decorationCollection.clear();
    if (newDecos.length > 0) {
      decorationCollection.set(newDecos);
    }
  };

  // 关键修改：使用更可靠的初始化渲染
  const initializeDecorations = () => {
    // 等待编辑器完全初始化
    if (!editor.getModel()) {
      setTimeout(initializeDecorations, 50);
      return;
    }

    renderDecorations()

    // 监听模型就绪事件
    const model = editor.getModel();
    if (model) {
      model.onDidChangeContent(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(renderDecorations, 100);
      });
    }
  };

  // 启动初始化
  initializeDecorations();


  // 5. 防抖更新
  editor.onDidChangeModelContent(() => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(renderDecorations, 100)
  })

  // ③ 返回精简外壳
  return {
    dispose: () => {
      if (timer) clearTimeout(timer)
      editor.dispose()
    },
    getValue: () => editor.getValue(),
    setValue: (v) => {
      editor.setValue(v)
      setTimeout(renderDecorations, 50)
    },
    setLanguage: (lang) => {
      monaco.editor.setModelLanguage(editor.getModel()!, lang)
      setTimeout(renderDecorations, 50)
    },
    setTheme: (t) => monaco.editor.setTheme(t),
    getMonacoInstance: () => editor,
    getDecorationCollection: () => decorationCollection,
    updateOptions: (option: any) => {
      editor.updateOptions(option)
      setTimeout(renderDecorations, 50)
    }
  };
}