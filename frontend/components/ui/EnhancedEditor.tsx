"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";

interface EnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface BlobInfo {
  blob: () => Blob;
  filename: () => string;
}

interface RespondWith {
  string: (callback: () => Promise<string>) => void;
}

export default function EnhancedEditor({ content, onChange, placeholder }: EnhancedEditorProps) {
  const { theme } = useTheme();

  if (!process.env.NEXT_PUBLIC_TINYMCE_API_KEY) {
    console.warn('TinyMCE API key is not set. Please add NEXT_PUBLIC_TINYMCE_API_KEY to your .env.local file');
    return (
      <div className="border rounded-md p-4 text-center text-gray-500">
        Editor configuration is incomplete. Please check the console for details.
      </div>
    );
  }

  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      initialValue={content}
      init={{
        // Core configurations
        menubar: true,
        min_height: 500,
        plugins: [
          // Core editing features
          'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 
          'image', 'link', 'lists', 'media', 'searchreplace', 'table', 
          'visualblocks', 'wordcount',
          // Premium features
          'checklist', 'mediaembed', 'casechange', 'formatpainter', 
          'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 
          'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 
          'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 
          'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown',
          'importword', 'exportword', 'exportpdf'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                'bold italic underline strikethrough | link image media table mergetags | ' +
                'addcomment showcomments | spellcheckdialog a11ycheck typography | ' +
                'align lineheight | checklist numlist bullist indent outdent | ' +
                'emoticons charmap | removeformat',
        content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:16px }',
        placeholder: placeholder,
        skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: theme === 'dark' ? 'dark' : 'default',
        
        // Advanced features configuration
        tinycomments_mode: 'embedded',
        tinycomments_author: 'Admin', // You can make this dynamic based on the logged-in user
        mergetags_list: [
          { value: 'First.Name', title: 'First Name' },
          { value: 'Email', title: 'Email' },
        ],
        ai_request: (request: unknown, respondWith: RespondWith) => 
          respondWith.string(() => Promise.reject('AI Assistant not configured')),
        
        // Image upload handling
        images_upload_handler: async (blobInfo: BlobInfo) => {
          try {
            const file = blobInfo.blob();
            const filePath = `blog-images/${Date.now()}-${blobInfo.filename()}`;
            
            const { data, error } = await supabase.storage
              .from('the-house')
              .upload(filePath, file);

            if (error) throw error;

            // Get the public URL for the uploaded image
            const { data: { publicUrl } } = supabase.storage
              .from('the-house')
              .getPublicUrl(filePath);

            return publicUrl;
          } catch (error) {
            console.error('Image upload failed:', error);
            throw new Error('Image upload failed');
          }
        },
        
        // Additional configurations
        paste_data_images: true,
        automatic_uploads: true,
        file_picker_types: 'image',
        importcss_append: true,
        
        // Table features
        table_appearance_options: true,
        table_grid: true,
        table_class_list: [
          {title: 'None', value: ''},
          {title: 'Bordered', value: 'border-all'},
          {title: 'Striped', value: 'striped'}
        ],
        
        // Typography and formatting
        style_formats: [
          { title: 'Headings', items: [
            { title: 'Heading 1', format: 'h1' },
            { title: 'Heading 2', format: 'h2' },
            { title: 'Heading 3', format: 'h3' },
            { title: 'Heading 4', format: 'h4' }
          ]},
          { title: 'Inline', items: [
            { title: 'Bold', format: 'bold' },
            { title: 'Italic', format: 'italic' },
            { title: 'Underline', format: 'underline' },
            { title: 'Strikethrough', format: 'strikethrough' },
            { title: 'Code', format: 'code' }
          ]},
          { title: 'Blocks', items: [
            { title: 'Paragraph', format: 'p' },
            { title: 'Blockquote', format: 'blockquote' },
            { title: 'Code Block', format: 'pre' }
          ]}
        ],
        
        // Setup event handlers
        setup: (editor: any) => {
          editor.on('Change', () => {
            onChange(editor.getContent());
          });
          
          // Add custom keyboard shortcuts
          editor.addShortcut('Meta+S', 'Save', () => {
            // You can implement save functionality here
            console.log('Save shortcut triggered');
          });
        }
      }}
    />
  );
} 