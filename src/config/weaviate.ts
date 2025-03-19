import * as weaviate from 'weaviate-client';

interface CustomOptions {
  host: string;
  scheme: string;
  headers?: Record<string, string>;
}

interface SchemaClass {
  class?: string;
  properties?: Array<{
    name: string;
    dataType: string[];
  }>;
}
import type { WeaviateConfig, WeaviateSchema } from '../types/weaviate.js';

const config: WeaviateConfig = {
  host: 'localhost',
  scheme: 'http',
  port: 8080,
};

export const schema: WeaviateSchema = {
  class: 'Image',
  vectorizer: 'img2vec-neural',
  moduleConfig: {
    'img2vec-neural': {
      imageFields: ['image'],
    },
  },
  properties: [
    {
      name: 'image',
      dataType: ['blob'],
    },
    {
      name: 'text',
      dataType: ['string'],
      description: 'Optional description or caption for the image',
    },
  ],
};

export const createWeaviateClient = async () => {
  const options: CustomOptions = {
    host: `${config.host}:${config.port}`,
    scheme: config.scheme,
    headers: config.headers
  };
  return await weaviate.connectToCustom(options);
};

export const initializeSchema = async (client: unknown): Promise<void> => {
  try {
    // Try to get the schema class
    const existingSchema = await (client as any).schema.get();

    const classExists = existingSchema.classes?.some((c: SchemaClass) => 
      c.class !== undefined && c.class === schema.class
    );

    if (!classExists) {
      // Create schema if it doesn't exist
      await (client as any).schema.create(schema);
      console.log(`Created schema for class: ${schema.class}`);
    } else {
      console.log(`Schema for class ${schema.class} already exists`);
    }
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw new Error('Failed to initialize Weaviate schema');
  }
};

export default {
  config,
  schema,
  createWeaviateClient,
  initializeSchema,
};
