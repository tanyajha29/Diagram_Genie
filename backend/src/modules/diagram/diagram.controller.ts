import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiagramGenerationService } from './diagram-generation.service';
import { generateDiagramSchema, GenerateDiagramDto } from './dto/generate-diagram.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('Diagram Generation')
@Controller('diagrams')
export class DiagramController {
  constructor(private readonly generationService: DiagramGenerationService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate UDM and React Flow graphs from code sources' })
  @ApiResponse({ status: 201, description: 'Diagram generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid syntax or missing parser configuration' })
  @UsePipes(new ZodValidationPipe(generateDiagramSchema))
  async generate(@Body() dto: GenerateDiagramDto) {
    return this.generationService.generate(dto);
  }
}
