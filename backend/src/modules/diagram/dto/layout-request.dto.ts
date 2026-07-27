import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const layoutRequestSchema = z.object({
  diagram: z.any(),
  layoutEngineId: z.string().min(1, 'Layout Engine ID is required'),
  options: z.record(z.string(), z.any()).optional(),
});

export class LayoutRequestDto {
  @ApiProperty({ description: 'The UDM diagram model representation' })
  diagram!: any;

  @ApiProperty({ description: 'The layout algorithm ID to apply (e.g. tree, grid, radial)', example: 'radial' })
  layoutEngineId!: string;

  @ApiProperty({ description: 'Optional formatting spacing or coordinate variables', example: {}, required: false })
  options?: Record<string, any>;
}
