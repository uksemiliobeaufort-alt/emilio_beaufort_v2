"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Type,
  Palette
} from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const fontFamilies = [
  { name: 'Default', value: 'Inter' },
  { name: 'Serif', value: 'Georgia' },
  { name: 'Mono', value: 'monospace' },
];

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#666666' },
  { name: 'Red', value: '#ff0000' },
  { name: 'Blue', value: '#0000ff' },
];

const fontSizes = [
  { name: 'Small', value: '0.875em' },
  { name: 'Normal', value: '1em' },
  { name: 'Large', value: '1.25em' },
  { name: 'XL', value: '1.5em' },
];

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      Underline,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
        {/* Text Style Controls */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-gray-200' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment Controls */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* List Controls */}
        <div className="flex items-center gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Font Controls */}
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-input bg-white px-2 py-1 text-sm focus:outline-none"
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          >
            {fontFamilies.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>

          <select
            className="h-8 rounded-md border border-input bg-white px-2 py-1 text-sm focus:outline-none"
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          >
            {fontSizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.name}
              </option>
            ))}
          </select>

          <select
            className="h-8 rounded-md border border-input bg-white px-2 py-1 text-sm focus:outline-none"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          >
            {colors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Floating Format Menu */}
      {editor && (
        <BubbleMenu
          className="flex items-center gap-1 p-1 rounded-lg bg-white border shadow-lg"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-gray-200' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  );
} 