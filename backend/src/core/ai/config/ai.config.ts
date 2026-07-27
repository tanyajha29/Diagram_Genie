import { z } from 'zod';

export const aiConfigSchema = z.object({
  defaultProvider: z.string().default('gemini'),
  geminiApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
});

export type AiConfig = z.infer<typeof aiConfigSchema>;
