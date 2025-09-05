"use client";

import { useState, useEffect } from 'react';

interface ImageFormatDebuggerProps {
  imageUrl: string;
  productName: string;
}

export default function ImageFormatDebugger({ imageUrl, productName }: ImageFormatDebuggerProps) {
  const [imageInfo, setImageInfo] = useState<{
    format: string;
    size: string;
    loaded: boolean;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    
    img.onload = () => {
      // Get image format from URL or headers
      let format = 'unknown';
      if (imageUrl.includes('format=webp')) {
        format = 'WebP';
      } else if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')) {
        format = 'JPEG';
      } else if (imageUrl.includes('.png')) {
        format = 'PNG';
      } else if (imageUrl.includes('.gif')) {
        format = 'GIF';
      }

      setImageInfo({
        format,
        size: `${img.naturalWidth}x${img.naturalHeight}`,
        loaded: true,
        error: false
      });
    };

    img.onerror = () => {
      setImageInfo({
        format: 'error',
        size: '0x0',
        loaded: false,
        error: true
      });
    };

    img.src = imageUrl;
  }, [imageUrl]);

  if (!imageInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-50 max-w-xs">
      <div className="font-bold">{productName}</div>
      <div>Format: <span className={imageInfo.format === 'WebP' ? 'text-green-400' : 'text-yellow-400'}>{imageInfo.format}</span></div>
      <div>Size: {imageInfo.size}</div>
      <div>Status: <span className={imageInfo.loaded ? 'text-green-400' : 'text-red-400'}>{imageInfo.loaded ? 'Loaded' : 'Error'}</span></div>
      <div className="text-gray-300 break-all text-xs mt-1">{imageUrl}</div>
    </div>
  );
}
