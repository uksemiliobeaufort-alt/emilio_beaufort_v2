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
  unoptimized?: boolean;
  referrerPolicy?: React.HTMLAttributes<HTMLImageElement>["referrerPolicy"];
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
  unoptimized,
  referrerPolicy,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  largeScreenSrc,
}: HydrationSafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackTried, setFallbackTried] = useState<string[]>([]);
  const [useNativeImg, setUseNativeImg] = useState(false);

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

  // Build ordered fallback list without duplicates
  const fallbackList = Array.from(
    new Set(
      [currentSrc, largeScreenSrc, desktopSrc, tabletSrc, mobileSrc, src].filter(
        (u): u is string => Boolean(u)
      )
    )
  );

  const handleError = () => {
    // Try next available source not yet tried
    const tried = new Set(fallbackTried.concat([currentSrc]));
    const next = fallbackList.find((u) => !tried.has(u));
    if (next && next !== currentSrc) {
      setFallbackTried(Array.from(tried));
      setCurrentSrc(next);
      return;
    }
    // As last resort, switch to native <img> to bypass Next optimizer in case of remote fetch issues
    setUseNativeImg(true);
    onError?.();
  };

  if (useNativeImg) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        referrerPolicy={referrerPolicy ?? 'no-referrer'}
        crossOrigin="anonymous"
        onLoad={onLoad as any}
        onError={() => {
          onError?.();
        }}
      />
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
      unoptimized={unoptimized}
      referrerPolicy={referrerPolicy ?? 'no-referrer'}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}
