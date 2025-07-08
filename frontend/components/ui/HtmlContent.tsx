"use client";

import React from 'react';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
  return (
    <>
      <div 
        className={`blog-content prose prose-sm max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          // Override prose styles for better blog content display
          lineHeight: '1.6',
        }}
      />
      <style jsx global>{`
        /* Bulletproof list styling with editor-matching spacing */
        .blog-content ul,
        .blog-content ol {
          margin: 1.5em 0 !important;
          padding: 0 !important;
          list-style: none !important;
        }
        
        .blog-content ul li,
        .blog-content ol li {
          position: relative !important;
          padding-left: 1.5em !important;
          margin: 0.8em 0 !important;
          line-height: 1.8 !important;
        }
        
        /* Bullet points using ::before pseudo-elements */
        .blog-content ul li::before {
          content: "•" !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #333 !important;
          font-weight: bold !important;
          font-size: 1.2em !important;
        }
        
        /* Numbered lists */
        .blog-content ol {
          counter-reset: list-counter !important;
        }
        
        .blog-content ol li {
          counter-increment: list-counter !important;
        }
        
        .blog-content ol li::before {
          content: counter(list-counter) "." !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          color: #333 !important;
          font-weight: bold !important;
        }
        
        /* Nested lists with proper indentation */
        .blog-content ul ul,
        .blog-content ol ol,
        .blog-content ul ol,
        .blog-content ol ul {
          margin: 0.5em 0 !important;
          padding-left: 1.5em !important;
        }
        
        .blog-content ul ul li::before {
          content: "○" !important;
        }
        
        .blog-content ul ul ul li::before {
          content: "■" !important;
        }
        
        /* Third level indentation */
        .blog-content ul ul ul,
        .blog-content ol ol ol,
        .blog-content ul ol ol,
        .blog-content ol ul ul {
          padding-left: 1.5em !important;
        }
        
        /* Preserve any data-indent attributes from TipTap */
        .blog-content [data-indent="1"] {
          padding-left: 2em !important;
        }
        
        .blog-content [data-indent="2"] {
          padding-left: 3.5em !important;
        }
        
        .blog-content [data-indent="3"] {
          padding-left: 5em !important;
        }
        
        /* Style attribute indentation support */
        .blog-content [style*="padding-left"] {
          /* Preserve inline padding from TipTap */
        }
        
        .blog-content [style*="margin-left"] {
          /* Preserve inline margin from TipTap */
        }
        
        /* Basic typography with editor-matching spacing */
        .blog-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1.5em 0 1em 0;
        }
        
        .blog-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1.5em 0 1em 0;
        }
        
        .blog-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1.5em 0 1em 0;
        }
        
        .blog-content p {
          margin: 1em 0;
        }
        
        .blog-content strong {
          font-weight: bold;
        }
        
        .blog-content em {
          font-style: italic;
        }
        
        .blog-content u {
          text-decoration: underline;
        }
        
        .blog-content s {
          text-decoration: line-through;
        }
        
        .blog-content a {
          color: #0066cc;
          text-decoration: underline;
        }
        
        .blog-content blockquote {
          border-left: 3px solid #ddd;
          margin: 1em 0;
          padding-left: 1em;
          font-style: italic;
        }
        
        .blog-content code {
          background-color: #f4f4f4;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .blog-content mark {
          background-color: #fef08a;
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        
        /* Preserve TipTap styling */
        .blog-content [style*="color"] {
          /* Preserve inline colors */
        }
        
        .blog-content [style*="text-align: center"] {
          text-align: center;
        }
        
        .blog-content [style*="text-align: right"] {
          text-align: right;
        }
        
        .blog-content [style*="text-align: justify"] {
          text-align: justify;
        }
        
        /* Additional spacing between different content types */
        .blog-content ul + p,
        .blog-content ol + p,
        .blog-content p + ul,
        .blog-content p + ol {
          margin-top: 1.5em !important;
        }
        
        .blog-content h1 + ul,
        .blog-content h2 + ul,
        .blog-content h3 + ul,
        .blog-content h1 + ol,
        .blog-content h2 + ol,
        .blog-content h3 + ol {
          margin-top: 1em !important;
        }
      `}</style>
    </>
  );
}

// Usage example:
// <HtmlContent content={post.content} className="text-gray-800" /> 