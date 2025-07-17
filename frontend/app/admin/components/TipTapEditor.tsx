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

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }

      setIsUploading(true);
      try {
        const localUrl = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: localUrl }).run();
        onAddImage(file, localUrl);
        toast.success('Image added (will upload on save)');
      } catch (error: any) {
        console.error('Image add failed:', error);
        toast.error(error.message || 'Failed to add image');
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

  if (!editor) {
    return null;
  }

  // Primary actions (always visible)
  const primaryActions = [
    {
      label: 'Bold',
      icon: <Bold className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'), can: editor.can().chain().focus().toggleBold().run(), type: 'button'
    },
    {
      label: 'Italic',
      icon: <Italic className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'), can: editor.can().chain().focus().toggleItalic().run(), type: 'button'
    },
    {
      label: 'Underline',
      icon: <UnderlineIcon className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'), can: editor.can().chain().focus().toggleUnderline().run(), type: 'button'
    },
    {
      label: 'Font Color',
      icon: <Palette className="h-4 w-4" />, onClick: () => setColorPickerOpen((v) => !v),
      isActive: false, can: true, isColor: true, type: 'button'
    },
    {
      label: 'Link',
      icon: <LinkIcon className="h-4 w-4" />, onClick: () => setLinkDialogOpen(true),
      isActive: editor.isActive('link'), can: true, type: 'button'
    },
    {
      label: 'Image',
      icon: <ImageIcon className="h-4 w-4" />, onClick: addImage,
      isActive: false, can: !isUploading, type: 'button'
    },
  ];

  // Secondary actions (in popover)
  const secondaryActions = [
    {
      label: 'H1',
      icon: <Heading1 className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }), can: editor.can().chain().focus().toggleHeading({ level: 1 }).run()
    },
    {
      label: 'H2',
      icon: <Heading2 className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }), can: editor.can().chain().focus().toggleHeading({ level: 2 }).run()
    },
    {
      label: 'H3',
      icon: <Heading3 className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }), can: editor.can().chain().focus().toggleHeading({ level: 3 }).run()
    },
    {
      label: 'Strike',
      icon: <Strikethrough className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'), can: editor.can().chain().focus().toggleStrike().run()
    },
    {
      label: 'Highlight',
      icon: <Highlighter className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'), can: editor.can().chain().focus().toggleHighlight().run()
    },
    {
      label: 'Align Left',
      icon: <AlignLeft className="h-4 w-4" />, onClick: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }), can: true
    },
    {
      label: 'Align Center',
      icon: <AlignCenter className="h-4 w-4" />, onClick: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }), can: true
    },
    {
      label: 'Align Right',
      icon: <AlignRight className="h-4 w-4" />, onClick: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }), can: true
    },
    {
      label: 'Align Justify',
      icon: <AlignJustify className="h-4 w-4" />, onClick: () => editor.chain().focus().setTextAlign('justify').run(),
      isActive: editor.isActive({ textAlign: 'justify' }), can: true
    },
    {
      label: 'Bullet List',
      icon: <List className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'), can: editor.can().chain().focus().toggleBulletList().run()
    },
    {
      label: 'Ordered List',
      icon: <ListOrdered className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'), can: editor.can().chain().focus().toggleOrderedList().run()
    },
    {
      label: 'Blockquote',
      icon: <Quote className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'), can: true
    },
    {
      label: 'Code',
      icon: <Code className="h-4 w-4" />, onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'), can: true
    },
    {
      label: 'Font Color',
      icon: <Palette className="h-4 w-4" />, onClick: (e: any) => {
        setColorAnchor(e.currentTarget);
        setColorPickerOpen(true);
      },
      isActive: false, can: true, isColor: true
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white p-4 rounded-t-lg flex flex-wrap gap-2 items-center relative">
      {/* Primary actions */}
      {primaryActions.map((action, idx) => (
        <div key={action.label} className="relative">
          <Button
            type={action.type === 'submit' || action.type === 'reset' ? action.type : 'button'}
            variant={action.isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={action.isColor ? () => setColorPickerOpen((v) => !v) : action.onClick}
            disabled={!action.can}
            aria-label={action.label}
          >
            {action.icon}
          </Button>
          {/* Color picker popover for Font Color */}
          {action.isColor && colorPickerOpen && (
            <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50 bg-white p-3 rounded-lg shadow-lg flex flex-col items-center gap-2 border">
              <div className="flex gap-1 mb-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      editor.chain().focus().setColor(color).run();
                      setColorPickerOpen(false);
                    }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={e => {
                  setSelectedColor(e.target.value);
                  editor.chain().focus().setColor(e.target.value).run();
                  setColorPickerOpen(false);
                }}
                className="w-8 h-8 border-none bg-transparent cursor-pointer shadow"
                style={{ boxShadow: 'none' }}
                autoFocus
              />
            </div>
          )}
        </div>
      ))}
      {/* More menu for secondary actions */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          aria-label="More formatting options"
          onClick={() => setPopoverOpen((v) => !v)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        {popoverOpen && (
          <div
            ref={popoverRef}
            className="absolute left-0 mt-2 z-50 bg-white border rounded-lg shadow-lg p-4 grid grid-cols-2 gap-2 min-w-[320px] max-w-md"
          >
            {secondaryActions.map((action) => (
              <Button
                key={action.label}
                variant={action.isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={(e) => { 
                  if (action.isColor) {
                    action.onClick(e);
                  } else {
                    action.onClick(e);
                    setPopoverOpen(false);
                  }
                }}
                disabled={!action.can}
                aria-label={action.label}
                className={`flex flex-row items-center gap-2 justify-start w-full px-2 py-2 text-left
                  ${action.isActive ? 'bg-gray-200 text-black' : 'text-gray-800'}
                  ${!action.can ? 'text-gray-400 cursor-not-allowed' : ''}
                  hover:bg-gray-100 hover:text-black`}
              >
                {action.icon}
                <span className="text-sm ml-2 whitespace-nowrap">{action.label}</span>
                {/* Color picker popover */}
                {action.isColor && colorPickerOpen && (
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={e => {
                      setSelectedColor(e.target.value);
                      editor.chain().focus().setColor(e.target.value).run();
                      setColorPickerOpen(false);
                      setPopoverOpen(false);
                    }}
                    className="ml-2 w-6 h-6 border-none bg-transparent cursor-pointer"
                    style={{ boxShadow: 'none' }}
                    autoFocus
                  />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setLink();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={setLink}>
                Add Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(({ content, onChange, placeholder, onImagesChange }, ref) => {
  const [images, setImages] = useState<{ file: File, url: string }[]>([]);
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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Expose imperative handle for parent to get images and HTML
  useImperativeHandle(ref, () => ({
    getImages: () => images.map(img => img.file),
    getHTML: () => editor?.getHTML() || '',
  }), [images, editor]);

  // When an image is added, update the images state
  const handleAddImage = (file: File, url: string) => {
    setImages(prev => [...prev, { file, url }]);
    if (onImagesChange) onImagesChange(images.map(img => img.file).concat(file));
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <MenuBar editor={editor} onAddImage={handleAddImage} />
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