"use client";

import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
  fill?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  style,
  loading = 'lazy',
  onLoad,
  onError,
  width,
  height,
  fill = false,
}: OptimizedImageProps) {
  const [isClient, setIsClient] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show a placeholder during SSR and initial client render
  if (!isClient) {
    return (
      <div 
        className={`${className} bg-gray-200 animate-pulse`}
        style={{
          ...style,
          ...(fill ? { position: 'absolute', inset: 0 } : { width, height })
        }}
      />
    );
  }

  // If there's an image error, show a fallback
  if (imageError) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center`}
        style={{
          ...style,
          ...(fill ? { position: 'absolute', inset: 0 } : { width, height })
        }}
      >
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      width={width}
      height={height}
      onLoad={() => {
        setImageLoaded(true);
        onLoad?.();
      }}
      onError={() => {
        setImageError(true);
        onError?.();
      }}
      decoding="async"
    />
  );
}