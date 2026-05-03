export interface BlogPostRequest {
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  location: string;
  length: string;
  model: string;
}

export interface BlogPostResponse {
  content: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum AIModel {
  GEMINI_FLASH = 'gemini-3-flash-preview',
  GEMINI_PRO = 'gemini-3-pro-preview',
}