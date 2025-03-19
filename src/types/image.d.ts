export interface ImageData {
  buffer: Buffer;
  base64: string;
  metadata: {
    filename: string;
    mimeType: string;
    size: number;
  };
}

export interface ImageUploadResult {
  id: string;
  success: boolean;
  error?: string;
}

export interface ImageSearchOptions {
  limit?: number;
  threshold?: number;
  offset?: number;
}

// Interface for the full search result including image data
export interface FullImageSearchResult {
  id: string;
  image: string;
  text?: string;
  similarity: number;
}

// Interface for the summarized search result
export interface ImageSearchResult {
  id: string;
  text?: string;
  similarity: number;
}

export interface SearchResultSummary {
  total: number;
  results: ImageSearchResult[];
}
