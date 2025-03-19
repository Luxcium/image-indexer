import { describe, expect, test, beforeAll, afterAll, jest } from '@jest/globals';
import path from 'path';
import fs from 'fs/promises';
import imageSearchEngine from '../src/index.js';

describe('Image Search Engine', () => {
  beforeAll(async () => {
    // Setup test images directory
    await setupTestImages();
    // Mock console methods to verify they're called correctly
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Initialize the search engine
    await imageSearchEngine.initialize();
  });

  afterAll(async () => {
    // Restore console mocks
    jest.restoreAllMocks();
  });

  test('should initialize successfully', () => {
    // The initialization happens in beforeAll, so we just verify it completed
    expect(imageSearchEngine).toBeDefined();
  });

  test('should return image count', async () => {
    const count = await imageSearchEngine.getImageCount();
    // Count should be a number (can be zero if no images are indexed yet)
    expect(typeof count).toBe('number');
  });

  // Add more specific tests for your functions
  // For example, if you have an addImage function:
  // test('should add an image to the index', async () => {
  //   const testImagePath = path.join(process.cwd(), 'test/images/test.jpg');
  //   const result = await imageSearchEngine.addImage(testImagePath);
  //   expect(result).toBeTruthy();
  // });
});

/**
 * Helper function to set up test images directory
 */
async function setupTestImages(): Promise<void> {
  const testImagesDir = path.join(process.cwd(), 'test/images');
  
  try {
    await fs.access(testImagesDir);
  } catch {
    await fs.mkdir(testImagesDir, { recursive: true });
  }
}
