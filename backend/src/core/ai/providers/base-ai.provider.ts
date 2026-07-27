import { IAIProvider } from '../interfaces/ai-provider.interface';
import { IAIRequest } from '../interfaces/ai-request.interface';
import { IAIResponse } from '../interfaces/ai-response.interface';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly name: string;
  protected readonly apiKey: string;
  protected readonly endpoint: string;
  protected readonly logger: Logger;

  constructor(protected readonly configService: ConfigService) {
    const upperName = this.name.toUpperCase();
    this.apiKey = this.configService.get<string>(`AI_${upperName}_API_KEY`, '');
    this.endpoint = this.configService.get<string>(`AI_${upperName}_ENDPOINT`, '');
    this.logger = new Logger(this.constructor.name);
  }

  abstract generate(request: IAIRequest): Promise<IAIResponse>;
  abstract stream(request: IAIRequest): Promise<AsyncGenerator<IAIResponse>>;
  abstract healthCheck(): Promise<boolean>;

  // Wrapper method supporting timeout, exponential retry backoff, logging, and AbortSignal cancellation
  protected async executeWithPipeline<T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    request: IAIRequest
  ): Promise<T> {
    const timeoutMs = request.options?.timeout || 30000;
    const maxRetries = request.options?.maxRetries || 3;
    const signal: AbortSignal | undefined = request.options?.abortSignal;

    const startTime = Date.now();
    this.logger.log(`[${this.name.toUpperCase()}] Starting request. Prompt Char Length: ${request.prompt.length}`);

    let attempt = 0;
    while (true) {
      attempt++;
      if (signal?.aborted) {
        this.logger.warn(`[${this.name.toUpperCase()}] Request aborted before execution.`);
        throw new Error('AI Request aborted by client.');
      }

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)
        );

        const result = await Promise.race([
          operation(signal),
          timeoutPromise
        ]);

        const duration = Date.now() - startTime;
        this.logger.log(`[${this.name.toUpperCase()}] Completed successfully in ${duration}ms (Attempt: ${attempt})`);
        return result;

      } catch (error: any) {
        this.logger.error(`[${this.name.toUpperCase()}] Request execution failed (Attempt: ${attempt}): ${error?.message || error}`);

        if (attempt >= maxRetries || signal?.aborted) {
          throw error;
        }

        // Exponential backoff logic
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.log(`[${this.name.toUpperCase()}] Scheduling backoff retry in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
