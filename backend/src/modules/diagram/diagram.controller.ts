import { Controller, Post, Get, Body, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiagramGenerationService } from './diagram-generation.service';
import { generateDiagramSchema, GenerateDiagramDto } from './dto/generate-diagram.dto';
import { layoutRequestSchema, LayoutRequestDto } from './dto/layout-request.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('Diagram Engine API')
@Controller('diagrams')
export class DiagramController {
  constructor(private readonly generationService: DiagramGenerationService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate UDM and React Flow graphs from code sources' })
  @ApiResponse({ status: 201, description: 'Diagram generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid syntax or validation issues' })
  @UsePipes(new ZodValidationPipe(generateDiagramSchema))
  async generate(@Body() dto: GenerateDiagramDto) {
    return this.generationService.generate(dto);
  }

  @Post('layout')
  @ApiOperation({ summary: 'Apply layout positioning calculations to an existing UDM diagram' })
  @ApiResponse({ status: 201, description: 'Layout applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid layout request payload' })
  @UsePipes(new ZodValidationPipe(layoutRequestSchema))
  async applyLayout(@Body() dto: LayoutRequestDto) {
    return this.generationService.applyLayout(dto);
  }

  @Get('tools')
  @ApiOperation({ summary: 'Get catalog list of all available diagram tools' })
  @ApiResponse({ status: 200, description: 'List of tools retrieved successfully' })
  async getTools() {
    return this.generationService.getTools();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get list of all diagram categories' })
  @ApiResponse({ status: 200, description: 'List of categories retrieved successfully' })
  async getCategories() {
    return this.generationService.getCategories();
  }

  @Get('ai-metrics')
  @ApiOperation({ summary: 'Get real-time observability metrics for AI generation latency and success rates' })
  @ApiResponse({ status: 200, description: 'AI performance metrics retrieved successfully' })
  async getAiMetrics() {
    return this.generationService.getAiMetrics();
  }
}
