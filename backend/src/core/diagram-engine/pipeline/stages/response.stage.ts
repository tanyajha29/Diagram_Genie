import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { DiagramGenerationResponse, Warning } from '../../contracts/response.contracts';

@Injectable()
export class ResponseStage implements PipelineStage {
  readonly id = 'response-stage';
  readonly order = 100;
  readonly enabled = true;
  readonly required = true;

  supports(context: GenerationContext): boolean {
    return true; // Always compile response payload
  }

  async execute(context: GenerationContext): Promise<void> {
    const tool = context.metadata.tool;
    
    // Calculate total elapsed duration since orchestrator received request
    const startTimeMs = context.metadata.startTime || Date.now();
    const duration = Date.now() - startTimeMs;

    // Aggregate diagnostic metadata mappings from execution trace records
    const stages: Record<string, number> = {};
    for (const [key, value] of Object.entries(context.stageExecution)) {
      if (value.durationMs !== undefined) {
        stages[key] = value.durationMs;
      }
    }

    const warnings: Warning[] = context.warnings.map(w => ({
      code: 'GEN_WARNING',
      message: w
    }));

    const responsePayload: DiagramGenerationResponse = {
      success: context.errors.length === 0,
      diagram: context.diagram,
      reactFlow: context.rendererOutput,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: context.errors.length > 0 ? context.errors : undefined,
      diagnostics: {
        parserType: tool ? tool.parserId : 'unknown',
        layoutEngineId: tool ? tool.layoutId : 'unknown',
        fileTypeDetected: context.detectedFileType,
        validationSuccess: context.errors.length === 0
      },
      metadata: {
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
        executionDurationMs: duration,
        stages
      }
    };

    context.response = responsePayload;
  }
}
