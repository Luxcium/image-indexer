# Image Search Engine with Weaviate

A TypeScript-based image search engine that uses Weaviate and neural networks to find similar images based on visual content.

## Features

- Image similarity search using neural networks (ResNet50)
- Support for multiple image formats (JPEG, PNG, GIF, WebP)
- Batch processing of image directories
- Vector-based similarity search
- Persistent storage with Weaviate
- Type-safe implementation with TypeScript
- Docker-based deployment

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- TypeScript
- At least 8GB RAM (recommended)
- ~10GB free disk space for Docker images

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd image-indexer
```
2. Install dependencies:
```bash
npm install
```
3. Start Weaviate services:
```bash
cd docker
docker-compose up -d
```
4. Build the project:
```bash
npm run build
```

## Usage

### Basic Example

```typescript
import imageSearchEngine from './dist';
import path from 'path';

async function main() {
  // Initialize the engine
  await imageSearchEngine.initialize();

  // Index a directory of images
  const imagesDir = path.join(process.cwd(), 'test/images');
  await imageSearchEngine.indexDirectory(imagesDir);

  // Search for similar images
  const queryImage = path.join(imagesDir, 'query.jpg');
  const results = await imageSearchEngine.findSimilarImages(queryImage, {
    limit: 5,
    threshold: 0.7
  });

  console.log(results);
}

main().catch(console.error);
```

### Running the Example

1. Place some test images in the `test/images` directory

2. Run the example script:
```bash
npm run build
node dist/example.js
```

Similar images will be saved to the `similar_images` directory.

## API Reference

### ImageSearchEngine

- `initialize()`: Initialize the search engine
- `indexImage(imagePath: string)`: Index a single image
- `indexDirectory(dirPath: string)`: Index all images in a directory
- `findSimilarImages(queryImagePath: string, options?: ImageSearchOptions)`: Find similar images
- `deleteImage(id: string)`: Delete an indexed image
- `getImageCount()`: Get total number of indexed images

### ImageSearchOptions

```typescript
interface ImageSearchOptions {
  limit?: number;      // Maximum number of results (default: 10)
  threshold?: number;  // Minimum similarity score (0-1, default: 0.7)
  offset?: number;     // Pagination offset
}
```

## Project Structure

```tree
image-indexer/
├── src/
│   ├── config/
│   │   └── weaviate.ts      # Weaviate configuration
│   ├── services/
│   │   ├── imageService.ts  # Image processing
│   │   └── searchService.ts # Search functionality
│   ├── types/
│   │   ├── image.d.ts      # Image-related types
│   │   └── weaviate.d.ts   # Weaviate types
│   ├── example.ts          # Usage example
│   └── index.ts           # Main entry point
├── docker/
│   └── docker-compose.yml  # Docker configuration
└── test/
    └── images/            # Test images directory
```

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Running Tests

```bash
npm test
```

## Technical Details

- Uses ResNet50 neural network for image vectorization
- Vectors are stored in Weaviate vector database
- Supports image files up to 10MB
- TypeScript for type safety
- Docker for deployment
- Persistent storage via Docker volumes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Acknowledgments

- Weaviate for vector database
- ResNet50 for image vectorization
