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
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle responsive image selection
  useEffect(() => {
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
  }, [src, mobileSrc, tabletSrc, desktopSrc, largeScreenSrc]);

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
        onError?.();
      }}
    />
  );
}
