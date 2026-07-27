export class PromptTemplate {
  constructor(
    public readonly version: string,
    public readonly systemPrompt: string,
    public readonly developerPrompt: string,
    public readonly userPromptTemplate: string
  ) {}

  build(placeholders: Record<string, string>): { system: string; developer: string; user: string } {
    const replace = (text: string) => {
      let result = text;
      Object.entries(placeholders).forEach(([key, value]) => {
        // Find and replace all instances of {{placeholder}}
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      return result;
    };

    return {
      system: replace(this.systemPrompt),
      developer: replace(this.developerPrompt),
      user: replace(this.userPromptTemplate),
    };
  }
}
