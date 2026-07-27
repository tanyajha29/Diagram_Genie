export interface IAIResponse {
  text: string;
  rawResponse?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
