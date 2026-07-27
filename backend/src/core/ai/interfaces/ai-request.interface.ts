export interface IAIRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
  options?: Record<string, any>;
}
