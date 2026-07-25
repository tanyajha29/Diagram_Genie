import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const generateDiagramSchema = z.object({
  source: z.string().min(1, 'Source code cannot be empty'),
  sourceType: z.string().min(1, 'Source type is required'),
  layoutEngineId: z.string().optional(),
  options: z.record(z.string(), z.any()).optional(),
});

export class GenerateDiagramDto {
  @ApiProperty({ description: 'Source code content to parse into a diagram', example: '[Client] -> [API Gateway]' })
  source!: string;

  @ApiProperty({ description: 'The format type of the source code (e.g. sql, md, architecture)', example: 'architecture' })
  sourceType!: string;

  @ApiProperty({ description: 'The desired layout alignment engine ID', example: 'default', required: false })
  layoutEngineId?: string;

  @ApiProperty({ description: 'Custom parsing configuration options', example: {}, required: false })
  options?: Record<string, any>;
}
