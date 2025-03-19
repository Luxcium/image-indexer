import fs from 'fs/promises';
import path from 'path';
import { ImageData, ImageUploadResult } from '../types/image.js';

export class ImageService {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Load and process an image file
   */
  public async loadImage(filePath: string): Promise<ImageData> {
    try {
      const buffer = await fs.readFile(filePath);
      const filename = path.basename(filePath);
      
      // Basic file type checking based on magic numbers
      const mimeType = this.detectMimeType(buffer);
      
      if (!mimeType || !ImageService.ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      if (buffer.length > ImageService.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed size of ${ImageService.MAX_FILE_SIZE} bytes`);
      }

      return {
        buffer,
        base64: buffer.toString('base64'),
        metadata: {
          filename,
          mimeType,
          size: buffer.length
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load image: ${error.message}`);
      }
      throw new Error('Failed to load image: Unknown error');
    }
  }

  /**
   * Save an image from base64 string
   */
  public async saveImage(base64: string, outputPath: string): Promise<void> {
    try {
      const buffer = Buffer.from(base64, 'base64');
      await fs.writeFile(outputPath, buffer);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save image: ${error.message}`);
      }
      throw new Error('Failed to save image: Unknown error');
    }
  }

  /**
   * Detect MIME type based on file magic numbers
   */
  private detectMimeType(buffer: Buffer): string | null {
    const magicNumbers = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46]
    };

    for (const [mimeType, numbers] of Object.entries(magicNumbers)) {
      if (numbers.every((number, index) => buffer[index] === number)) {
        return mimeType;
      }
    }

    return null;
  }

  /**
   * Validate image data
   */
  /**
   * Create directory if it doesn't exist
   */
  public async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Validate image data
   */
  public validateImage(data: ImageData): boolean {
    return (
      Buffer.isBuffer(data.buffer) &&
      typeof data.base64 === 'string' &&
      data.base64.length > 0 &&
      typeof data.metadata.filename === 'string' &&
      typeof data.metadata.mimeType === 'string' &&
      ImageService.ALLOWED_MIME_TYPES.includes(data.metadata.mimeType) &&
      typeof data.metadata.size === 'number' &&
      data.metadata.size > 0 &&
      data.metadata.size <= ImageService.MAX_FILE_SIZE
    );
  }

  /**
   * Process multiple images in a directory
   */
  public async processDirectory(dirPath: string): Promise<ImageData[]> {
    const files = await fs.readdir(dirPath);
    const images: ImageData[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile()) {
          const image = await this.loadImage(filePath);
          images.push(image);
        }
      } catch (error) {
        console.error(`Failed to process ${file}:`, error);
        // Continue with next file
      }
    }

    return images;
  }
}

export default new ImageService();
