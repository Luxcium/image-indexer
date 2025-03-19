import path from 'path';
import fs from 'fs/promises';
import imageSearchEngine from '../src/index.js';

async function setupTestImages(): Promise<void> {
  const testImagesDir = path.join(process.cwd(), 'test/images');
  
  try {
    await fs.access(testImagesDir);
  } catch {
    await fs.mkdir(testImagesDir, { recursive: true });
  }

  console.log('Test images directory ready:', testImagesDir);
}

async function runTests(): Promise<void> {
  try {
    // Setup test environment
    await setupTestImages();

    // Initialize the search engine
    console.log('Initializing search engine...');
    await imageSearchEngine.initialize();
    console.log('Search engine initialized successfully');

    // Count images in the database
    const count = await imageSearchEngine.getImageCount();
    console.log('Current image count:', count);

    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run tests
console.log('Starting tests...\n');
runTests().catch(console.error);
