export class TokenUtils {
  static estimateTokens(text: string): number {
    // Basic character-length token estimation fallback rule (averages 4 characters per token)
    return Math.ceil(text.length / 4);
  }
}
