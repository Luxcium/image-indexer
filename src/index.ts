import path from 'path';
import imageService from './services/imageService.js';
import searchService from './services/searchService.js';
import { ImageData, ImageSearchOptions, ImageSearchResult } from './types/image.js';

export class ImageSearchEngine {
  /**
   * Initialize the search engine
   */
  public async initialize(): Promise<void> {
    try {
      await searchService.initialize();
      console.log('Image search engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize image search engine:', error);
      throw error;
    }
  }

  /**
   * Index a single image
   */
  public async indexImage(imagePath: string): Promise<string> {
    try {
      const imageData = await imageService.loadImage(imagePath);
      const id = await searchService.addImage(imageData);
      console.log(`Indexed image ${path.basename(imagePath)} with ID: ${id}`);
      return id;
    } catch (error) {
      console.error(`Failed to index image ${imagePath}:`, error);
      throw error;
    }
  }

  /**
   * Index all images in a directory
   */
  public async indexDirectory(dirPath: string): Promise<string[]> {
    try {
      const images = await imageService.processDirectory(dirPath);
      const ids: string[] = [];

      for (const image of images) {
        try {
          const id = await searchService.addImage(image);
          ids.push(id);
          console.log(`Indexed ${image.metadata.filename} with ID: ${id}`);
        } catch (error) {
          console.error(`Failed to index ${image.metadata.filename}:`, error);
        }
      }

      return ids;
    } catch (error) {
      console.error(`Failed to process directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Find similar images
   */
  public async findSimilarImages(
    queryImagePath: string,
    options?: ImageSearchOptions
  ) {
    try {
      const queryImage = await imageService.loadImage(queryImagePath);
      const results = await searchService.findSimilarImages(queryImage, options);

      // Create output directory if it doesn't exist
      const outputDir = path.join(process.cwd(), 'similar_images');
      await imageService.createDirectoryIfNotExists(outputDir);

      // Save similar images
      for (const [index, result] of results.entries()) {
        const outputPath = path.join(
          outputDir,
          `similar_${index + 1}_${result.similarity.toFixed(2)}.jpg`
        );
        await imageService.saveImage(result.image, outputPath);
      }

      return {
        total: results.length,
        results: results.map((r: ImageSearchResult) => ({
          id: r.id,
          similarity: r.similarity,
          text: r.text
        }))
      };
    } catch (error) {
      console.error(`Failed to find similar images for ${queryImagePath}:`, error);
      throw error;
    }
  }

  /**
   * Delete an indexed image
   */
  public async deleteImage(id: string): Promise<boolean> {
    try {
      const success = await searchService.deleteImage(id);
      if (success) {
        console.log(`Successfully deleted image with ID: ${id}`);
      }
      return success;
    } catch (error) {
      console.error(`Failed to delete image ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the total number of indexed images
   */
  public async getImageCount(): Promise<number> {
    try {
      return await searchService.getImageCount();
    } catch (error) {
      console.error('Failed to get image count:', error);
      throw error;
    }
  }
}

// Create and export a default instance
export default new ImageSearchEngine();

// Also export the class for those who want to create their own instances
export { ImageData, ImageSearchOptions };
