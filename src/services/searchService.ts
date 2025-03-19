import { WeaviateClient } from 'weaviate-client';
import { ImageData, ImageSearchOptions, FullImageSearchResult, ImageSearchResult } from '../types/image.js';
import { WeaviateImage, WeaviateQueryResult } from '../types/weaviate.js';
import weaviateConfig, { schema } from '../config/weaviate.js';

export class SearchService {
  private client: any;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  /**
   * Initialize the search service and ensure schema exists
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      this.client = await weaviateConfig.createWeaviateClient();
      await weaviateConfig.initializeSchema(this.client);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize search service:', error);
      throw error;
    }
  }

  /**
   * Wait for initialization to complete
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    if (this.initializationPromise) {
      await this.initializationPromise;
    } else {
      await this.initialize();
    }
  }

  /**
   * Add an image to the vector database
   */
  public async addImage(imageData: ImageData): Promise<string> {
    try {
      await this.ensureInitialized();

      const result = await this.client.data
        .creator()
        .withClassName(schema.class)
        .withProperties({
          image: imageData.base64,
          text: imageData.metadata.filename,
        })
        .do();

      if (!result?.id) {
        throw new Error('Failed to get ID from created object');
      }

      return result.id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add image: ${error.message}`);
      }
      throw new Error('Failed to add image: Unknown error');
    }
  }

  /**
   * Find similar images based on a query image
   */
  public async findSimilarImages(
    queryImage: ImageData,
    options: ImageSearchOptions = {}
  ): Promise<FullImageSearchResult[]> {
    try {
      await this.ensureInitialized();
      
      const { limit = 10, threshold = 0.7 } = options;

      const result = await this.client.graphql
        .get()
        .withClassName(schema.class)
        .withFields('image text _additional { certainty distance }')
        .withNearImage({ image: queryImage.base64 })
        .withLimit(limit)
        .do();

      const queryResult = result as WeaviateQueryResult<WeaviateImage>;
      
      if (!queryResult.data?.Get?.[schema.class]) {
        return [];
      }

      return queryResult.data.Get[schema.class]
        .filter(img => (img._additional?.certainty || 0) >= threshold)
        .map((img: WeaviateImage) => ({
          id: img.id,
          image: img.image,
          text: img.text,
          similarity: img._additional?.certainty || 0
        }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search images: ${error.message}`);
      }
      throw new Error('Failed to search images: Unknown error');
    }
  }

  /**
   * Delete an image from the vector database
   */
  public async deleteImage(id: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      await this.client.data
        .deleter()
        .withClassName(schema.class)
        .withId(id)
        .do();

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
      throw new Error('Failed to delete image: Unknown error');
    }
  }

  /**
   * Get total count of images in the database
   */
  public async getImageCount(): Promise<number> {
    try {
      await this.ensureInitialized();

      const result = await this.client.graphql
        .aggregate()
        .withClassName(schema.class)
        .withFields('meta { count }')
        .do();

      return result.data.Aggregate[schema.class][0].meta.count;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get image count: ${error.message}`);
      }
      throw new Error('Failed to get image count: Unknown error');
    }
  }
}

export default new SearchService();
