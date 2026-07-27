import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  provider: z.string().optional(),
  systemInstruction: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
});

export class GenerateTextDto {
  @ApiProperty({ description: 'Text prompt command instructions for the AI engine model', example: 'List 5 cloud features' })
  prompt!: string;

  @ApiProperty({ description: 'The identifier name of the AI provider model', example: 'gemini', required: false })
  provider?: string;

  @ApiProperty({ description: 'The guiding persona instructions context for the LLM', example: 'You are an engineer', required: false })
  systemInstruction?: string;

  @ApiProperty({ description: 'Sampling parameter controls representing response creativity randomness', example: 0.7, required: false })
  temperature?: number;

  @ApiProperty({ description: 'Maximum completion response length constraints', example: 1000, required: false })
  maxTokens?: number;
}
