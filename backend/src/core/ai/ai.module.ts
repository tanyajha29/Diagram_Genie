import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './services/ai.service';
import { AIManager } from './services/ai-manager';
import { AiPipeline } from './services/ai-pipeline';
import { ProviderRegistry } from './registry/provider.registry';
import { ProviderFactory } from './factory/provider.factory';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GroqProvider } from './providers/groq.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AiObservabilityService } from './observability/ai-observability.service';
import { AiTestingController } from './controllers/ai-testing.controller';

// Prompt Management System imports
import { PromptRegistry } from './prompts/prompt.registry';
import { PromptLoader } from './prompts/prompt.loader';
import { PromptBuilder } from './prompts/prompt.builder';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AiTestingController],
  providers: [
    ProviderRegistry,
    ProviderFactory,
    AiService,
    AIManager,
    AiPipeline,
    AiObservabilityService,
    // AI model provider strategies
    GeminiProvider,
    OpenAIProvider,
    AnthropicProvider,
    GroqProvider,
    OllamaProvider,
    // Prompt Management components
    PromptRegistry,
    PromptLoader,
    PromptBuilder,
  ],
  exports: [
    AiService,
    AIManager,
    AiPipeline,
    AiObservabilityService,
    ProviderRegistry,
    ProviderFactory,
    PromptRegistry,
    PromptBuilder,
  ],
})
export class AiModule {}

export type { IAIRequest } from './interfaces/ai-request.interface';
export type { IAIResponse } from './interfaces/ai-response.interface';
export type { IAIProvider } from './interfaces/ai-provider.interface';
export type { IAIService } from './interfaces/ai-service.interface';
export { BaseAIProvider } from './providers/base-ai.provider';
export { AiProviderException } from './exceptions/ai-provider.exception';
export type { AIModelType } from './types/ai-model.types';
export { TokenUtils } from './utils/token.utils';
export { AI_PROVIDERS_TOKEN } from './constants';
export { PromptTemplate } from './prompts/prompt-template';
export { PromptRegistry } from './prompts/prompt.registry';
export { PromptBuilder } from './prompts/prompt.builder';
export { AIManager } from './services/ai-manager';
export { AiPipeline } from './services/ai-pipeline';
export { AiObservabilityService } from './observability/ai-observability.service';
