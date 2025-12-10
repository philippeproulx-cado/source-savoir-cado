export interface Source {
  title: string;
  uri: string;
}

export interface ResearchResult {
  aspect: string;
  summary: string;
  sources: Source[];
  resultType?: ResultType; // Added to conditionally render cards
  error?: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export type ResultType = 'short' | 'long' | 'sources';

export interface SearchOptions {
  type: ResultType;
  includeEnglishSources: boolean;
}

export interface BrainstormResult {
  overview: string;
  suggestedAspects: string[];
}