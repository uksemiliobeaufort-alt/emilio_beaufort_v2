"use client";

import { useState, useEffect, useCallback } from 'react';
import { imageService, ImageProcessingOptions, ImageLoadResult } from '@/lib/imageService';

interface UseOptimizedImageOptions extends ImageProcessingOptions {
  preload?: boolean;
  fallbackUrl?: string;
}

interface UseOptimizedImageReturn {
  imageUrl: string;
  isLoading: boolean;
  isError: boolean;
  format: string;
  fallbackUsed: boolean;
  error?: string;
  retry: () => void;
}

/**
 * Advanced hook for optimized image loading with WebP conversion
 */
export function useOptimizedImage(
  originalUrl: string,
  options: UseOptimizedImageOptions = {}
): UseOptimizedImageReturn {
  const [result, setResult] = useState<ImageLoadResult>({
    url: originalUrl,
    format: 'unknown',
    loaded: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const loadImage = useCallback(async () => {
    // Only run on client side and after hydration
    if (typeof window === 'undefined' || !isHydrated) {
      return;
    }

    if (!originalUrl) {
      setResult({
        url: options.fallbackUrl || '',
        format: 'unknown',
        loaded: false,
        error: 'No URL provided'
      });
      setIsLoading(false);
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      console.log('🔄 Loading optimized image:', {
        originalUrl,
        options,
        retryCount
      });

      const loadResult = await imageService.loadImageWithFallback(originalUrl, options);
      
      setResult(loadResult);
      setIsLoading(false);
      setIsError(!loadResult.loaded);

      console.log('✅ Image load result:', {
        url: loadResult.url,
        format: loadResult.format,
        loaded: loadResult.loaded,
        fallbackUsed: loadResult.fallbackUsed
      });

    } catch (error) {
      console.error('❌ Image loading failed:', error);
      
      setResult({
        url: options.fallbackUrl || originalUrl,
        format: 'unknown',
        loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsLoading(false);
      setIsError(true);
    }
  }, [originalUrl, options, retryCount, isHydrated]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Only run on client side and after hydration
    if (typeof window !== 'undefined' && isHydrated) {
      loadImage();
    }
  }, [loadImage, isHydrated]);

  // Preload if requested
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && options.preload && originalUrl) {
      imageService.preloadImages([originalUrl], options);
    }
  }, [originalUrl, options.preload, options, isHydrated]);

  return {
    imageUrl: result.url,
    isLoading,
    isError,
    format: result.format,
    fallbackUsed: result.fallbackUsed || false,
    error: result.error,
    retry
  };
}

/**
 * Hook for batch image optimization
 */
export function useBatchOptimizedImages(
  urls: string[],
  options: UseOptimizedImageOptions = {}
) {
  const [results, setResults] = useState<ImageLoadResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only run on client side and after hydration
    if (typeof window === 'undefined' || !isHydrated) {
      return;
    }

    if (!urls.length) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    const loadAllImages = async () => {
      try {
        const promises = urls.map(url => 
          imageService.loadImageWithFallback(url, options)
        );
        
        const results = await Promise.allSettled(promises);
        const loadResults = results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              url: urls[index],
              format: 'unknown',
              loaded: false,
              error: result.reason?.message || 'Load failed'
            };
          }
        });

        setResults(loadResults);
        setIsLoading(false);
        setIsError(loadResults.some(r => !r.loaded));

        console.log('🔄 Batch image loading completed:', {
          total: urls.length,
          successful: loadResults.filter(r => r.loaded).length,
          failed: loadResults.filter(r => !r.loaded).length
        });

      } catch (error) {
        console.error('❌ Batch image loading failed:', error);
        setIsLoading(false);
        setIsError(true);
      }
    };

    loadAllImages();
  }, [urls, options, isHydrated]);

  return {
    results,
    isLoading,
    isError,
    successfulCount: results.filter(r => r.loaded).length,
    failedCount: results.filter(r => !r.loaded).length
  };
}
