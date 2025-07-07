"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import debounce from 'lodash/debounce';
import dynamic from 'next/dynamic';

interface QuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Import Quill with noSSR
const ReactQuill = dynamic(
  () => import('react-quill').then((mod) => {
    const { default: RQ } = mod;
    return function DynamicQuill(props: any) {
      return <RQ {...props} />;
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-md p-4 w-full h-[400px] bg-gray-50 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    )
  }
) as any; // Type assertion to avoid type issues

export default function QuillEditor({ content, onChange, placeholder }: QuillEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [editor, setEditor] = useState<any>(null);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      onChange(value);
    }, 500),
    [onChange]
  );

  // Update local content immediately but debounce parent update
  const handleChange = (value: string) => {
    setLocalContent(value);
    debouncedOnChange(value);
  };

  // Sync local content with prop
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    setMounted(true);
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // Get editor instance after mount
  useEffect(() => {
    if (mounted) {
      const editorElement = document.querySelector('.quill-wrapper .ql-editor');
      if (editorElement) {
        // Using type assertion for the Quill instance
        const quillInstance = (editorElement as any).__quill;
        if (quillInstance) {
          setEditor(quillInstance);
        }
      }
    }
  }, [mounted]);

  const imageHandler = () => {
    if (!editor) return;

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
        const filePath = `blog-images/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('the-house')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('the-house')
          .getPublicUrl(filePath);

        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, 'image', publicUrl);
        editor.setSelection(range.index + 1);
        toast.success('Image uploaded successfully');
      } catch (error: any) {
        console.error('Image upload failed:', error);
        toast.error(error.message || 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    },
    keyboard: {
      bindings: {
        tab: false
      }
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  if (!mounted) {
    return (
      <div className="border rounded-md p-4 w-full h-[400px] bg-gray-50 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="quill-wrapper">
      <style jsx global>{`
        /* Quill Snow Theme */
        .ql-container {
          box-sizing: border-box;
          font-family: Inter, sans-serif;
          font-size: 16px;
          height: 100%;
          margin: 0px;
          position: relative;
        }
        .ql-container.ql-snow {
          border: 1px solid #e5e7eb;
          border-top: 0;
        }
        .ql-toolbar {
          box-sizing: border-box;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem 0.375rem 0 0;
          background-color: #f9fafb;
        }
        .ql-toolbar.ql-snow {
          border: 1px solid #e5e7eb;
          box-sizing: border-box;
          font-family: Inter, sans-serif;
          padding: 8px;
        }
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 15px;
        }
        .ql-snow .ql-toolbar button,
        .ql-snow .ql-picker {
          color: #374151;
        }
        .ql-snow .ql-stroke {
          stroke: #374151;
        }
        .ql-snow .ql-fill {
          fill: #374151;
        }
        .ql-snow.ql-toolbar button:hover,
        .ql-snow .ql-toolbar button:hover {
          color: #000;
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow .ql-toolbar button:hover .ql-stroke {
          stroke: #000;
        }
        .ql-snow.ql-toolbar button:hover .ql-fill,
        .ql-snow .ql-toolbar button:hover .ql-fill {
          fill: #000;
        }
        .ql-editor {
          box-sizing: border-box;
          line-height: 1.42;
          height: 100%;
          outline: none;
          overflow-y: auto;
          padding: 12px 15px;
          tab-size: 4;
          -moz-tab-size: 4;
          text-align: left;
          white-space: pre-wrap;
          word-wrap: break-word;
          min-height: 200px;
          max-height: 500px;
        }
        .ql-editor p,
        .ql-editor ol,
        .ql-editor ul,
        .ql-editor pre,
        .ql-editor blockquote,
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3 {
          margin: 0;
          padding: 0;
          counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
        }
        .ql-editor ol,
        .ql-editor ul {
          padding-left: 1.5em;
        }
        .ql-editor ol > li,
        .ql-editor ul > li {
          list-style-type: none;
        }
        .ql-editor ul > li::before {
          content: '•';
        }
        .ql-editor ol li {
          counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
          counter-increment: list-0;
        }
        .ql-editor ol li:before {
          content: counter(list-0, decimal) '. ';
        }
        .ql-editor .ql-align-center {
          text-align: center;
        }
        .ql-editor .ql-align-right {
          text-align: right;
        }
        .ql-editor .ql-align-justify {
          text-align: justify;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .ql-snow .ql-tooltip {
          background-color: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border-radius: 0.375rem;
          color: #374151;
          padding: 5px 12px;
          white-space: nowrap;
        }
        .ql-snow .ql-tooltip input[type=text] {
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          font-size: 14px;
          height: 26px;
          margin: 0;
          padding: 3px 5px;
          width: 170px;
        }
        
        /* Add loading state styles */
        .quill-wrapper.uploading .ql-toolbar,
        .quill-wrapper.uploading .ql-container {
          opacity: 0.7;
          pointer-events: none;
        }
        
        /* Improve toolbar button styles */
        .ql-snow .ql-toolbar button {
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .ql-snow .ql-toolbar button:hover {
          background-color: #f3f4f6;
        }
        
        .ql-snow .ql-toolbar button.ql-active {
          background-color: #e5e7eb;
        }
        
        /* Improve dropdown styles */
        .ql-snow .ql-picker {
          border-radius: 4px;
        }
        
        .ql-snow .ql-picker-options {
          border-radius: 4px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        /* Add focus styles */
        .ql-container.ql-snow:focus-within {
          border-color: #6366f1;
          ring: 2px;
          ring-color: rgb(99 102 241 / 0.2);
        }
      `}</style>
      <div className={isUploading ? 'uploading' : ''}>
        {mounted && (
          <ReactQuill
            theme="snow"
            value={localContent}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
} 