import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderFactory } from '../factory/provider.factory';
import { PromptBuilder } from '../prompts/prompt.builder';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import { SCHEMAS_BY_CATEGORY } from '../validation/ai-extraction.schemas';
import { AIValidationException } from '../exceptions/ai-validation.exception';
import { AiObservabilityService } from '../observability/ai-observability.service';

@Injectable()
export class AIManager {
  private readonly logger = new Logger(AIManager.name);
  private readonly defaultProvider: string;
  private readonly isAiEnabled: boolean;

  constructor(
    private readonly providerFactory: ProviderFactory,
    private readonly promptBuilder: PromptBuilder,
    private readonly configService: ConfigService,
    private readonly observabilityService: AiObservabilityService
  ) {
    this.defaultProvider = this.configService.get<string>('AI_DEFAULT_PROVIDER', 'gemini').toLowerCase();

    const geminiKey = this.configService.get<string>('AI_GEMINI_API_KEY');
    const openaiKey = this.configService.get<string>('AI_OPENAI_API_KEY');
    const enabledFlag = this.configService.get<string>('AI_ENABLED');

    this.isAiEnabled = enabledFlag === 'true' && (!!geminiKey || !!openaiKey || this.defaultProvider === 'ollama');
    this.logger.log(`AIManager initialized. isAiEnabled=${this.isAiEnabled}`);
  }

  isEnabled(): boolean {
    return this.isAiEnabled;
  }

  async executeExtraction(
    category: string,
    version: string,
    placeholders: Record<string, string>,
    options?: { provider?: string; timeout?: number; abortSignal?: AbortSignal; correlationId?: string }
  ): Promise<IAIResponse> {
    if (!this.isAiEnabled) {
      throw new BadRequestException('AI operations are disabled or API credentials are not configured.');
    }

    const correlationId = options?.correlationId || `corr_${Math.random().toString(36).substring(2, 9)}`;
    const providerName = options?.provider || this.defaultProvider;
    const provider = this.providerFactory.createProvider(providerName);
    const modelName = options?.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash';

    const promptDetails = this.promptBuilder.build(category, version, placeholders);
    
    // Log sensitive user content only if DEBUG is enabled
    const debugMode = this.configService.get<string>('DEBUG') === 'true';
    if (debugMode) {
      this.logger.debug(`[Correlation: ${correlationId}] User prompt context: ${promptDetails.user}`);
    }

    const request: IAIRequest = {
      prompt: promptDetails.user,
      systemInstruction: promptDetails.system || undefined,
      responseMimeType: 'application/json',
      options: {
        timeout: options?.timeout,
        abortSignal: options?.abortSignal
      }
    };

    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 2; 
    let lastRawResponse = '';

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await provider.generate(request);
        lastRawResponse = response.text || '';

        if (!lastRawResponse.trim()) {
          throw new Error('Received empty response from AI model.');
        }

        let jsonText = this.extractJson(lastRawResponse);
        jsonText = this.repairJson(jsonText);

        const parsedObject = JSON.parse(jsonText);
        const schema = SCHEMAS_BY_CATEGORY[category.toLowerCase()];
        
        if (schema) {
          const validationResult = schema.safeParse(parsedObject);
          if (!validationResult.success) {
            throw new Error(`Schema validation failed: ${JSON.stringify(validationResult.error.errors)}`);
          }
          
          // Log success transaction
          this.observabilityService.logTransaction({
            correlationId,
            provider: providerName,
            model: modelName,
            latencyMs: Date.now() - startTime,
            promptVersion: version,
            tokensIn: response.usage?.promptTokens,
            tokensOut: response.usage?.completionTokens,
            retryCount: attempts - 1,
            validationStatus: 'success',
            fallbackUsed: false
          });

          return {
            ...response,
            text: JSON.stringify(validationResult.data)
          };
        }

        // Log success transaction without schema
        this.observabilityService.logTransaction({
          correlationId,
          provider: providerName,
          model: modelName,
          latencyMs: Date.now() - startTime,
          promptVersion: version,
          tokensIn: response.usage?.promptTokens,
          tokensOut: response.usage?.completionTokens,
          retryCount: attempts - 1,
          validationStatus: 'success',
          fallbackUsed: false
        });

        return {
          ...response,
          text: JSON.stringify(parsedObject)
        };

      } catch (err: any) {
        this.logger.warn(`AI extraction attempt ${attempts} failed validation: ${err?.message}`);

        if (attempts >= maxAttempts) {
          // Log failure transaction
          this.observabilityService.logTransaction({
            correlationId,
            provider: providerName,
            model: modelName,
            latencyMs: Date.now() - startTime,
            promptVersion: version,
            retryCount: attempts - 1,
            validationStatus: 'failed',
            fallbackUsed: true,
            error: err?.message
          });

          throw new AIValidationException(category, err?.message || 'Zod validation failed.', lastRawResponse);
        }

        request.prompt = `
You previously returned an invalid response that failed parsing/validation.
Error details: ${err?.message}
Raw response was:
"""
${lastRawResponse}
"""

Please correct the JSON response according to the requested schema. Return ONLY valid JSON:
${promptDetails.user}
`;
        request.temperature = 0.1;
      }
    }

    throw new AIValidationException(category, 'Unexpected pipeline flow completion.', lastRawResponse);
  }

  private extractJson(text: string): string {
    const trimmed = text.trim();
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return match ? match[1].trim() : trimmed;
  }

  private repairJson(jsonStr: string): string {
    let repaired = jsonStr.trim();
    repaired = repaired.replace(/,\s*([\}\]])/g, '$1');

    let curlyCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') curlyCount++;
        if (char === '}') curlyCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
    }

    if (inString) repaired += '"';
    while (bracketCount > 0) {
      repaired += ']';
      bracketCount--;
    }
    while (curlyCount > 0) {
      repaired += '}';
      curlyCount--;
    }

    return repaired;
  }
}
