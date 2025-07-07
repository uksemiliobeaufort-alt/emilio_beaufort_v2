"use client";

import React from 'react';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Override prose styles for better blog content display
        lineHeight: '1.6',
      }}
    />
  );
}

// Usage example:
// <HtmlContent content={post.content} className="text-gray-800" /> 