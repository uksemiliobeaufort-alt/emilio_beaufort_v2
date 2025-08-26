import sharp from 'sharp';

export interface CompressedImage {
  buffer: Buffer;
  format: string;
  size: number;
  width: number;
  height: number;
}

/**
 * Compresses an image to WebP format ensuring it's under the specified size limit
 * @param imageBuffer - The input image buffer
 * @param maxSizeBytes - Maximum size in bytes (default: 1MB)
 * @param quality - Initial quality setting (default: 80)
 * @returns Promise<CompressedImage>
 */
export async function compressImageToWebP(
  imageBuffer: Buffer,
  maxSizeBytes: number = 1024 * 1024, // 1MB default
  quality: number = 80
): Promise<CompressedImage> {
  let currentQuality = quality;
  let compressed: Buffer;
  let metadata: sharp.Metadata;

  // Get original image metadata
  const image = sharp(imageBuffer);
  metadata = await image.metadata();

  // Start with initial compression
  compressed = await image
    .webp({ quality: currentQuality, effort: 6 })
    .toBuffer();

  // If still too large, reduce quality iteratively
  while (compressed.length > maxSizeBytes && currentQuality > 10) {
    currentQuality -= 10;
    compressed = await sharp(imageBuffer)
      .webp({ quality: currentQuality, effort: 6 })
      .toBuffer();
  }

  // If still too large, resize the image
  if (compressed.length > maxSizeBytes) {
    let width = metadata.width || 1920;
    let height = metadata.height || 1080;
    
    while (compressed.length > maxSizeBytes && width > 200) {
      width = Math.floor(width * 0.8);
      height = Math.floor(height * 0.8);
      
      compressed = await sharp(imageBuffer)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: Math.max(currentQuality, 20), effort: 6 })
        .toBuffer();
    }
  }

  const finalMetadata = await sharp(compressed).metadata();

  return {
    buffer: compressed,
    format: 'webp',
    size: compressed.length,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
  };
}

/**
 * Converts a base64 data URL to a Buffer
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @returns Buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}

/**
 * Converts a Buffer to a base64 data URL
 * @param buffer - Image buffer
 * @param mimeType - MIME type (default: 'image/webp')
 * @returns Base64 data URL string
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'image/webp'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Compresses multiple images concurrently
 * @param imageDataUrls - Array of base64 data URLs
 * @param maxSizeBytes - Maximum size per image in bytes
 * @returns Promise<string[]> - Array of compressed WebP data URLs
 */
export async function compressMultipleImages(
  imageDataUrls: string[],
  maxSizeBytes: number = 1024 * 1024
): Promise<string[]> {
  const compressionPromises = imageDataUrls.map(async (dataUrl) => {
    try {
      const buffer = dataUrlToBuffer(dataUrl);
      const compressed = await compressImageToWebP(buffer, maxSizeBytes);
      return bufferToDataUrl(compressed.buffer, 'image/webp');
    } catch (error) {
      console.error('Error compressing image:', error);
      // Return original if compression fails
      return dataUrl;
    }
  });

  return Promise.all(compressionPromises);
}

/**
 * Estimates the total size of blog content including images
 * @param content - HTML content string
 * @param images - Array of image data URLs
 * @returns Estimated size in bytes
 */
export function estimateBlogSize(content: string, images: string[]): number {
  // Estimate content size (UTF-8 encoding)
  const contentSize = new Blob([content]).size;
  
  // Estimate images size
  const imagesSize = images.reduce((total, dataUrl) => {
    const base64Data = dataUrl.split(',')[1];
    return total + (base64Data ? Buffer.from(base64Data, 'base64').length : 0);
  }, 0);

  return contentSize + imagesSize;
}
