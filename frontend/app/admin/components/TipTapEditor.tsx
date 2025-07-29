"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImagesChange?: (images: File[]) => void;
}

export interface TipTapEditorHandle {
  getImages: () => File[];
  getHTML: () => string;
}

const MenuBar = ({ editor, onAddImage }: { editor: any, onAddImage: (file: File, url: string) => void }) => {
  if (!editor) return null;
  
  const [isUploading, setIsUploading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');

  const presetColors = [
    '#000000', '#e11d48', '#2563eb', '#059669', '#f59e42', '#a21caf', '#fbbf24', '#10b981', '#6b7280', '#ffffff'
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [popoverOpen]);

  const addImage = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setIsUploading(true);
      try {
        // Create a blob URL for immediate preview
        const blobUrl = URL.createObjectURL(file);
        
        // Insert image into editor
        editor.chain().focus().setImage({ src: blobUrl }).run();
        
        // Call the onAddImage callback
        onAddImage(file, blobUrl);
        
        toast.success('Image added successfully');
      } catch (error) {
        console.error('Error adding image:', error);
        toast.error('Failed to add image');
      } finally {
        setIsUploading(false);
      }
    };
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkDialogOpen(false);
    }
  };

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-blue-100' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-blue-100' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-blue-100' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-blue-100' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-blue-100' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-blue-100' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-blue-100' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-blue-100' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-blue-100' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={addImage}
          disabled={isUploading}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLinkDialogOpen(true)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'bg-blue-100' : ''}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>

      {/* Color Picker */}
      <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                style={{ backgroundColor: color }}
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  setColorPickerOpen(false);
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(({ content, onChange, placeholder, onImagesChange }, ref) => {
  const [images, setImages] = useState<{ file: File, url: string }[]>([]);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: 'tiptap-bullet-list',
        },
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: {
          class: 'tiptap-ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'tiptap-list-item',
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      try {
        onChange(editor.getHTML());
      } catch (error) {
        console.error('Error in editor onUpdate:', error);
        setHasError(true);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      setIsEditorReady(true);
      setHasError(false);
    }
  }, [editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      try {
        editor.commands.setContent(content);
      } catch (error) {
        console.error('Error setting editor content:', error);
        setHasError(true);
      }
    }
  }, [content, editor]);

  // Expose imperative handle for parent to get images and HTML
  useImperativeHandle(ref, () => ({
    getImages: () => images?.map(img => img.file) || [],
    getHTML: () => {
      try {
        return isEditorReady && editor ? editor.getHTML() : '';
      } catch (error) {
        console.error('Error getting HTML from editor:', error);
        return '';
      }
    },
  }), [images, editor, isEditorReady]);

  // When an image is added, update the images state
  const handleAddImage = (file: File, url: string) => {
    setImages(prev => {
      const newImages = [...prev, { file, url }];
      if (onImagesChange) onImagesChange(newImages.map(img => img.file));
      return newImages;
    });
  };

  if (hasError) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="min-h-[180px] flex items-center justify-center text-red-500">
          Error loading editor. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {isEditorReady && editor && <MenuBar editor={editor} onAddImage={handleAddImage} />}
      {!isEditorReady && (
        <div className="min-h-[180px] flex items-center justify-center text-gray-500">
          Loading editor...
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="min-h-[180px] max-h-[300px] p-4 focus:outline-none resize-none"
        placeholder={placeholder}
      />
      <style jsx global>{`
        .ProseMirror {
          min-height: 180px;
          max-height: 300px;
          padding: 1rem;
          outline: none;
          overflow-y: auto;
          transition: max-height 0.2s;
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0 0.5em 0;
        }
        
        .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
          list-style-position: outside;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
          list-style-position: outside;
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .ProseMirror li {
          display: list-item;
          margin: 0.5em 0;
          padding-left: 0.5em;
        }
        
        .ProseMirror ul li::marker,
        .ProseMirror ol li::marker {
          color: currentColor;
        }
        
        /* Nested list styling in editor with proper indentation */
        .ProseMirror ul ul,
        .ProseMirror ol ol,
        .ProseMirror ul ol,
        .ProseMirror ol ul {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        .ProseMirror ul ul ul,
        .ProseMirror ol ol ol,
        .ProseMirror ul ol ol,
        .ProseMirror ol ul ul {
          padding-left: 1.5em;
        }
        
        .ProseMirror ul ul {
          list-style-type: circle;
        }
        
        .ProseMirror ul ul ul {
          list-style-type: square;
        }
        
        /* Support for TipTap indentation attributes */
        .ProseMirror [data-indent="1"] {
          padding-left: 2em !important;
        }
        
        .ProseMirror [data-indent="2"] {
          padding-left: 3.5em !important;
        }
        
        .ProseMirror [data-indent="3"] {
          padding-left: 5em !important;
        }
        
        /* Ensure spacing is preserved */
        .ProseMirror [style*="margin"],
        .ProseMirror [style*="padding"] {
          /* Preserve inline spacing */
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid #ddd;
          margin: 1em 0;
          padding-left: 1em;
          font-style: italic;
        }
        
        .ProseMirror code {
          background-color: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .ProseMirror pre {
          background-color: #f4f4f4;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }
        
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        
        .ProseMirror a {
          color: #0066cc;
          text-decoration: underline;
        }
        
        .ProseMirror mark {
          background-color: #fef08a;
        }
        
        .ProseMirror .is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
});

export default TipTapEditor; 