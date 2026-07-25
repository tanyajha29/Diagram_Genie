import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const generateDiagramSchema = z.object({
  source: z.string().min(1, 'Source code cannot be empty'),
  sourceType: z.string().optional(),
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  layoutEngineId: z.string().optional(),
  options: z.record(z.string(), z.any()).optional(),
});

export class GenerateDiagramDto {
  @ApiProperty({ description: 'Source code content to parse into a diagram', example: '[Client] -> [API Gateway]' })
  source!: string;

  @ApiProperty({ description: 'The format type of the source code (if known)', example: 'architecture', required: false })
  sourceType?: string;

  @ApiProperty({ description: 'The uploaded file name (to aid detection)', example: 'README.md', required: false })
  filename?: string;

  @ApiProperty({ description: 'The MIME type of the file (to aid detection)', example: 'text/markdown', required: false })
  mimeType?: string;

  @ApiProperty({ description: 'The desired layout alignment engine ID', example: 'default', required: false })
  layoutEngineId?: string;

  @ApiProperty({ description: 'Custom parsing configuration options', example: {}, required: false })
  options?: Record<string, any>;
}
