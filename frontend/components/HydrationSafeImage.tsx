"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HydrationSafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  // Responsive image sources
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc?: string;
  largeScreenSrc?: string;
}

export default function HydrationSafeImage({
  src,
  alt,
  fill = false,
  priority = false,
  quality = 75,
  sizes,
  className,
  placeholder,
  blurDataURL,
  width,
  height,
  style,
  onLoad,
  onError,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  largeScreenSrc,
}: HydrationSafeImageProps) {
  const [isClient, setIsClient] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle responsive image selection
  useEffect(() => {
    if (!isClient) return;

    const updateImageSrc = () => {
      const width = window.innerWidth;
      
      if (largeScreenSrc && width >= 1400) { // ultra-wide breakpoint
        setCurrentSrc(largeScreenSrc);
      } else if (desktopSrc && width >= 1024 && width < 1400) { // desktop range
        setCurrentSrc(desktopSrc);
      } else if (tabletSrc && width >= 768 && width < 1024) { // tablet range
        setCurrentSrc(tabletSrc);
      } else if (mobileSrc && width < 768) { // mobile range
        setCurrentSrc(mobileSrc);
      } else {
        setCurrentSrc(src); // fallback to default src
      }
    };

    updateImageSrc();
    window.addEventListener('resize', updateImageSrc);
    
    return () => window.removeEventListener('resize', updateImageSrc);
  }, [isClient, src, mobileSrc, tabletSrc, desktopSrc, largeScreenSrc]);

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
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      priority={priority}
      quality={quality}
      sizes={sizes}
      className={className}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      width={width}
      height={height}
      style={style}
      onLoad={onLoad}
      onError={() => {
        setImageError(true);
        onError?.();
      }}
    />
  );
}
