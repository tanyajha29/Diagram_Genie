import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AIManager } from '../services/ai-manager';
import { ProviderRegistry } from '../registry/provider.registry';

@ApiTags('AI Testing & Verification API')
@Controller('ai')
export class AiTestingController {
  constructor(
    private readonly aiManager: AIManager,
    private readonly providerRegistry: ProviderRegistry
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Retrieve health status across all registered AI providers' })
  @ApiResponse({ status: 200, description: 'Provider health checklist retrieved successfully' })
  async getHealth() {
    const providers = this.providerRegistry.getProviders();
    const healthStatus: Record<string, boolean> = {};
    for (const provider of providers) {
      healthStatus[provider.name] = await provider.healthCheck();
    }
    return healthStatus;
  }

  @Post('test')
  @ApiOperation({ summary: 'Generate raw text response from specified provider' })
  @ApiResponse({ status: 200, description: 'Raw response generated' })
  async testRaw(@Body() body: { provider?: string; prompt: string }) {
    if (!body.prompt) {
      throw new BadRequestException('Prompt parameter is required.');
    }
    const target = body.provider || 'gemini';
    const provider = this.providerRegistry.getProvider(target);
    if (!provider) {
      throw new BadRequestException(`AI Provider Strategy '${target}' is not registered.`);
    }
    return provider.generate({ prompt: body.prompt });
  }

  @Post('test/json')
  @ApiOperation({ summary: 'Execute prompt returning validated, repaired JSON content' })
  @ApiResponse({ status: 200, description: 'JSON structure generated successfully' })
  async testJson(@Body() body: { provider?: string; prompt: string; category?: string }) {
    if (!body.prompt) {
      throw new BadRequestException('Prompt parameter is required.');
    }
    const category = body.category || 'architecture';
    return this.aiManager.executeExtraction(
      category,
      'v1',
      { source: body.prompt },
      { provider: body.provider }
    );
  }

  @Post('test/architecture')
  @ApiOperation({ summary: 'Accepts README text and returns structured architecture JSON schema' })
  @ApiResponse({ status: 200, description: 'Architecture nodes/edges schema retrieved successfully' })
  async testArchitecture(@Body() body: { source: string; provider?: string }) {
    if (!body.source) {
      throw new BadRequestException('Source README parameter is required.');
    }
    return this.aiManager.executeExtraction(
      'architecture',
      'v1',
      { source: body.source },
      { provider: body.provider }
    );
  }

  @Post('test/database')
  @ApiOperation({ summary: 'Accepts DDL SQL statements and returns structured database schema JSON' })
  @ApiResponse({ status: 200, description: 'Database schema JSON retrieved successfully' })
  async testDatabase(@Body() body: { source: string; provider?: string }) {
    if (!body.source) {
      throw new BadRequestException('Source DDL SQL parameter is required.');
    }
    return this.aiManager.executeExtraction(
      'database',
      'v1',
      { source: body.source },
      { provider: body.provider }
    );
  }

  @Post('test/flow')
  @ApiOperation({ summary: 'Accepts flow script statements and returns structured process flow JSON' })
  @ApiResponse({ status: 200, description: 'Process flowchart JSON retrieved successfully' })
  async testFlow(@Body() body: { source: string; provider?: string }) {
    if (!body.source) {
      throw new BadRequestException('Source flow text parameter is required.');
    }
    return this.aiManager.executeExtraction(
      'flow',
      'v1',
      { source: body.source },
      { provider: body.provider }
    );
  }
}
