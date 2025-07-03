"use client";

import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

type EditorJS = any;
type EditorConfig = any;
type EditorTool = any;

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const editorId = 'editorjs-container';

  useEffect(() => {
    let editor: EditorJS | null = null;

    const initEditor = async () => {
      if (!editorRef.current) {
        try {
          const [
            { default: EditorJS },
            { default: Header },
            { default: List },
            { default: Paragraph },
            { default: Quote }
          ] = await Promise.all([
            import('@editorjs/editorjs'),
            import('@editorjs/header'),
            import('@editorjs/list'),
            import('@editorjs/paragraph'),
            import('@editorjs/quote')
          ]) as [
            { default: EditorJS },
            { default: EditorTool },
            { default: EditorTool },
            { default: EditorTool },
            { default: EditorTool }
          ];

          const config: EditorConfig = {
            holder: editorId,
            tools: {
              header: {
                class: Header,
                config: {
                  placeholder: 'Enter a header',
                  levels: [2, 3, 4],
                  defaultLevel: 2
                }
              },
              list: {
                class: List,
                inlineToolbar: true
              },
              paragraph: {
                class: Paragraph,
                inlineToolbar: true
              },
              quote: {
                class: Quote,
                inlineToolbar: true,
                config: {
                  quotePlaceholder: 'Enter a quote',
                  captionPlaceholder: 'Quote\'s author',
                }
              }
            },
            data: content ? JSON.parse(content) : {},
            onChange: async () => {
              const data = await editor?.save();
              onChange(JSON.stringify(data || {}));
            },
            placeholder: 'Click here to start writing...'
          };

          editor = new EditorJS(config);
          editorRef.current = editor;
        } catch (error) {
          console.error('Error initializing editor:', error);
        }
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [content, onChange]);

  return (
    <div className="min-h-[400px] border rounded-lg p-4">
      <div id={editorId} className="prose max-w-none" />
    </div>
  );
} 