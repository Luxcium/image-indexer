export interface WeaviateConfig {
  host: string;
  scheme: string;
  port: number;
  headers?: Record<string, string>;
}

export interface WeaviateSchema {
  class: string;
  vectorizer: string;
  moduleConfig: {
    [key: string]: {
      imageFields: string[];
    };
  };
  properties: {
    name: string;
    dataType: string[];
    description?: string;
  }[];
}

export interface WeaviateImage {
  id: string;
  class?: string;
  image: string;
  text?: string;
  _additional?: {
    certainty?: number;
    distance?: number;
  };
}

export interface WeaviateQueryResult<T> {
  data?: {
    Get?: {
      [className: string]: T[];
    };
    Aggregate?: {
      [className: string]: {
        meta: {
          count: number;
        };
      }[];
    };
  };
  errors?: {
    message: string;
  }[];
}

export interface WeaviateError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
}
