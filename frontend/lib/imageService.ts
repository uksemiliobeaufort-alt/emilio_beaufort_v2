/**
 * Advanced Image Service for WebP Conversion
 * Handles server-side WebP conversion with intelligent client-side optimization
 */

interface ImageProcessingOptions {
  format?: 'webp' | 'jpeg' | 'png';
  quality?: number;
  width?: number;
  height?: number;
  force?: boolean;
}

interface ImageLoadResult {
  url: string;
  format: string;
  loaded: boolean;
  error?: string;
  fallbackUsed?: boolean;
}

class ImageService {
  private static instance: ImageService;
  private cache = new Map<string, string>();
  private loadingPromises = new Map<string, Promise<string>>();

  private constructor() {}

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * Generate optimized image URL with WebP conversion
   */
  generateOptimizedUrl(
    originalUrl: string, 
    options: ImageProcessingOptions = {}
  ): string {
    const {
      format = 'webp',
      quality = 85,
      width,
      height,
      force = true
    } = options;

    // Check cache first
    const cacheKey = `${originalUrl}-${format}-${quality}-${width}-${height}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // If not a Firebase URL, return original
    if (!this.isFirebaseUrl(originalUrl)) {
      return originalUrl;
    }

    // Generate optimized URL
    const optimizedUrl = this.buildOptimizedUrl(originalUrl, {
      format,
      quality,
      width,
      height,
      force
    });

    // Cache the result
    this.cache.set(cacheKey, optimizedUrl);
    
    console.log('🖼️ Generated optimized URL:', {
      original: originalUrl,
      optimized: optimizedUrl,
      format,
      quality
    });

    return optimizedUrl;
  }

  /**
   * Load image with WebP fallback strategy
   */
  async loadImageWithFallback(
    originalUrl: string,
    options: ImageProcessingOptions = {}
  ): Promise<ImageLoadResult> {
    const webpUrl = this.generateOptimizedUrl(originalUrl, { ...options, format: 'webp' });
    
    try {
      // Try WebP first
      const webpResult = await this.testImageLoad(webpUrl);
      if (webpResult.loaded) {
        return {
          url: webpUrl,
          format: 'webp',
          loaded: true
        };
      }
    } catch (error) {
      console.log('⚠️ WebP loading failed, trying fallback:', error);
    }

    // Fallback to original format
    try {
      const originalResult = await this.testImageLoad(originalUrl);
      return {
        url: originalUrl,
        format: this.getImageFormat(originalUrl),
        loaded: originalResult.loaded,
        fallbackUsed: true,
        error: originalResult.error
      };
    } catch (error) {
      return {
        url: originalUrl,
        format: 'unknown',
        loaded: false,
        fallbackUsed: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Preload images for better performance
   */
  async preloadImages(urls: string[], options: ImageProcessingOptions = {}): Promise<void> {
    const promises = urls.map(url => 
      this.loadImageWithFallback(url, options).catch(error => {
        console.log('Preload failed for:', url, error);
        return { url, format: 'unknown', loaded: false, error: error.message };
      })
    );

    await Promise.allSettled(promises);
    console.log('🔄 Image preloading completed');
  }

  /**
   * Check if URL is from Firebase Storage
   */
  private isFirebaseUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com');
  }

  /**
   * Build optimized URL using image processing API
   */
  private buildOptimizedUrl(originalUrl: string, options: ImageProcessingOptions): string {
    const processorUrl = process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_URL;
    
    if (!processorUrl) {
      console.warn('⚠️ NEXT_PUBLIC_IMAGE_PROCESSOR_URL not configured');
      return originalUrl;
    }

    try {
      // Extract file path from Firebase URL
      const url = new URL(originalUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      
      if (!pathMatch) {
        console.warn('⚠️ Could not extract path from Firebase URL:', originalUrl);
        return originalUrl;
      }

      const filePath = decodeURIComponent(pathMatch[1]);
      const params = new URLSearchParams({
        path: filePath,
        format: options.format || 'webp',
        quality: (options.quality || 85).toString(),
        force: (options.force || true).toString()
      });

      if (options.width) params.set('width', options.width.toString());
      if (options.height) params.set('height', options.height.toString());

      return `${processorUrl}?${params.toString()}`;
    } catch (error) {
      console.error('❌ Error building optimized URL:', error);
      return originalUrl;
    }
  }

  /**
   * Test if image URL loads successfully
   */
  private testImageLoad(url: string): Promise<{ loaded: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve({ loaded: false, error: 'Timeout' });
      }, 10000); // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve({ loaded: true });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve({ loaded: false, error: 'Load failed' });
      };

      img.src = url;
    });
  }

  /**
   * Get image format from URL
   */
  private getImageFormat(url: string): string {
    if (url.includes('format=webp')) return 'webp';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpeg';
    if (url.includes('.png')) return 'png';
    if (url.includes('.gif')) return 'gif';
    return 'unknown';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();

// Export types
export type { ImageProcessingOptions, ImageLoadResult };
