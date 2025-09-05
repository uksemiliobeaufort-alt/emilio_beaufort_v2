"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useOptimizedImage } from '@/hooks/useOptimizedImage';
import { ImageProcessingOptions } from '@/lib/imageService';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  placeholder?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

/**
 * Advanced OptimizedImage component with WebP conversion and intelligent fallback
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  quality = 85,
  fallbackSrc,
  onLoad,
  onError,
  placeholder,
  loading = 'lazy',
  priority = false
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const processingOptions: ImageProcessingOptions = {
    format: 'webp',
    quality,
    width,
    height,
    force: true
  };

  const {
    imageUrl,
    isLoading,
    isError,
    format,
    fallbackUsed,
    error,
    retry
  } = useOptimizedImage(src, {
    ...processingOptions,
    preload: priority,
    fallbackUrl: fallbackSrc
  });

  // Handle image load events
  const handleImageLoad = () => {
    setImageLoaded(true);
    setShowPlaceholder(false);
    onLoad?.();
    
    console.log('🖼️ OptimizedImage loaded:', {
      src,
      imageUrl,
      format,
      fallbackUsed,
      dimensions: { width, height }
    });
  };

  const handleImageError = () => {
    console.error('❌ OptimizedImage failed to load:', {
      src,
      imageUrl,
      error,
      fallbackUsed
    });
    onError?.(error || 'Image load failed');
  };

  // Show placeholder while loading
  if (showPlaceholder && (isLoading || !imageLoaded)) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {placeholder || (
          <div className="text-gray-400 text-sm">
            {isLoading ? 'Loading...' : 'Loading image...'}
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (isError && !imageLoaded) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-500 text-sm mb-2">Failed to load image</div>
        <button
          onClick={retry}
          className="text-xs text-blue-500 hover:text-blue-700 underline"
        >
          Retry
        </button>
        {fallbackSrc && (
          <img
            src={fallbackSrc}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          <div>Format: {format}</div>
          <div>Fallback: {fallbackUsed ? 'Yes' : 'No'}</div>
          <div>URL: {imageUrl.substring(0, 50)}...</div>
        </div>
      )}
    </div>
  );
}

/**
 * Batch optimized image component for multiple images
 */
interface BatchOptimizedImagesProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }>;
  quality?: number;
  onAllLoaded?: () => void;
  onError?: (error: string) => void;
}

export function BatchOptimizedImages({
  images,
  quality = 85,
  onAllLoaded,
  onError
}: BatchOptimizedImagesProps) {
  const [loadedCount, setLoadedCount] = useState(0);

  const handleImageLoad = () => {
    setLoadedCount(prev => {
      const newCount = prev + 1;
      if (newCount === images.length) {
        onAllLoaded?.();
      }
      return newCount;
    });
  };

  const handleImageError = (error: string) => {
    onError?.(error);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={image.className}
          quality={quality}
          onLoad={handleImageLoad}
          onError={handleImageError}
          placeholder={
            <div className="text-gray-400 text-xs">
              Loading {index + 1}/{images.length}
            </div>
          }
        />
      ))}
    </div>
  );
}
