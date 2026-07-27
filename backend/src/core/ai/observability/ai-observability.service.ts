import { Injectable, Logger } from '@nestjs/common';

export interface ObservabilityLog {
  correlationId: string;
  provider: string;
  model: string;
  latencyMs: number;
  promptVersion: string;
  tokensIn?: number;
  tokensOut?: number;
  retryCount: number;
  validationStatus: 'success' | 'failed';
  fallbackUsed: boolean;
  error?: string;
}

@Injectable()
export class AiObservabilityService {
  private readonly logger = new Logger('AIObservability');

  // In-memory telemetry accumulator
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    validationFailures: 0,
    totalRetries: 0,
    totalLatencyMs: 0
  };

  logTransaction(log: ObservabilityLog) {
    this.metrics.totalRequests++;
    this.metrics.totalLatencyMs += log.latencyMs;
    this.metrics.totalRetries += log.retryCount;

    if (log.validationStatus === 'success') {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.validationFailures++;
    }

    if (log.error) {
      this.metrics.failedRequests++;
    }

    // Structured logging (no API keys or sensitive user prompts are output)
    this.logger.log({
      message: `[AI Observability Log] Correlation: ${log.correlationId}`,
      correlationId: log.correlationId,
      provider: log.provider,
      model: log.model,
      latencyMs: log.latencyMs,
      promptVersion: log.promptVersion,
      tokensIn: log.tokensIn || 0,
      tokensOut: log.tokensOut || 0,
      retryCount: log.retryCount,
      validationStatus: log.validationStatus,
      fallbackUsed: log.fallbackUsed,
      error: log.error || undefined
    });
  }

  getMetrics() {
    const total = this.metrics.totalRequests || 1;
    const avgResponseTime = this.metrics.totalLatencyMs / total;
    const successRate = (this.metrics.successfulRequests / total) * 100;
    const failureRate = (this.metrics.failedRequests / total) * 100;
    const validationFailureRate = (this.metrics.validationFailures / total) * 100;

    return {
      averageResponseTimeMs: Math.round(avgResponseTime),
      successRatePercent: Number(successRate.toFixed(2)),
      failureRatePercent: Number(failureRate.toFixed(2)),
      validationFailureRatePercent: Number(validationFailureRate.toFixed(2)),
      totalRequests: this.metrics.totalRequests,
      totalRetries: this.metrics.totalRetries,
      totalFailures: this.metrics.failedRequests
    };
  }
}
