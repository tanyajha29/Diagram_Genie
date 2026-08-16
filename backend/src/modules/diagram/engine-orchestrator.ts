import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { 
  GenerationPipeline, 
  GenerationContext, 
  DiagramGenerationResponse 
} from '../../core/diagram-engine/diagram-engine.module';

export interface OrchestratorResult {
  diagram: any;
  reactFlow: any;
  detectedType?: string;
  exportedFormats?: Record<string, string>;
}

@Injectable()
export class EngineOrchestrator {
  private readonly logger = new Logger(EngineOrchestrator.name);

  constructor(private readonly pipeline: GenerationPipeline) {
    // Validate stage registration integrity at startup
    this.pipeline.validate();
  }

  async orchestrate(
    source: string,
    sourceType?: string,
    filename?: string,
    mimeType?: string,
    layoutEngineId?: string,
    options?: Record<string, any>
  ): Promise<OrchestratorResult> {
    const requestId = `req_${Math.random().toString(36).substring(2, 9)}`;
    this.logger.log(`Instantiating pipeline context for request [${requestId}]`);

    // 1. Initialize context state container
    const context: GenerationContext = {
      requestId,
      timestamp: new Date().toISOString(),
      request: {
        source,
        sourceType,
        filename,
        mimeType,
        options: {
          ...options,
          layoutEngineId // pass layout engine overrides if requested
        }
      },
      warnings: [],
      errors: [],
      metadata: {
        startTime: Date.now()
      },
      stageExecution: {}
    };

    // 2. Execute pipeline stages sequentially
    await this.pipeline.execute(context);

    // 3. Halt and report errors if pipeline failed
    if (context.errors.length > 0) {
      this.logger.error(`Generation pipeline failed with ${context.errors.length} errors`);
      throw new BadRequestException({
        message: 'Diagram generation failed',
        errors: context.errors
      });
    }

    const response: DiagramGenerationResponse = context.response!;

    // 4. Map final response to backward-compatible output format
    return {
      diagram: response.diagram,
      reactFlow: response.reactFlow,
      detectedType: response.diagnostics?.fileTypeDetected || context.selectedTool,
      exportedFormats: {
        mermaid: '%% Export formatting pipeline hook placeholder'
      }
    };
  }
}
