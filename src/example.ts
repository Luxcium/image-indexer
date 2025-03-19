import path from 'path';
import imageSearchEngine from './index.js';
import type { ImageSearchResult } from './types/image.js';

async function main() {
  try {
    // Initialize the search engine
    await imageSearchEngine.initialize();
    console.log('Search engine initialized');

    // Index a directory of images
    const imagesDir = path.join(process.cwd(), 'test/images');
    const indexedIds = await imageSearchEngine.indexDirectory(imagesDir);
    console.log(`Indexed ${indexedIds.length} images`);

    // Get total count of indexed images
    const totalImages = await imageSearchEngine.getImageCount();
    console.log(`Total images in database: ${totalImages}`);

    // Find similar images for a query image
    const queryImagePath = path.join(imagesDir, 'query.jpg');
    const searchResults = await imageSearchEngine.findSimilarImages(queryImagePath, {
      limit: 5,
      threshold: 0.7
    });

    console.log('\nSearch Results:');
    console.log('==============');
    searchResults.results.forEach((result: { id: string; similarity: number; text?: string }, index: number) => {
      console.log(`${index + 1}. ID: ${result.id}`);
      console.log(`   Similarity: ${(result.similarity * 100).toFixed(2)}%`);
      console.log(`   Text: ${result.text || 'No description'}`);
      console.log('---');
    });

    console.log('\nSimilar images have been saved to the "similar_images" directory');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);

/*
Usage:
1. Make sure Docker is running
2. Start Weaviate services:
   cd docker && docker-compose up -d
3. Add some test images to test/images directory
4. Run this example:
   npm run build
   node dist/example.js
*/
