import { Injectable, Logger } from '@nestjs/common';
import { PipelineStage } from './pipeline-stage.interface';
import { GenerationContext, StageDiagnostic } from '../context/generation.context';

@Injectable()
export class GenerationPipeline {
  private readonly stages: PipelineStage[] = [];
  private readonly logger = new Logger(GenerationPipeline.name);

  /**
   * Registers a processing stage to the pipeline.
   */
  registerStage(stage: PipelineStage): void {
    if (this.stages.some(s => s.id === stage.id)) {
      throw new Error(`Pipeline registration failed: Duplicate stage ID '${stage.id}'`);
    }
    this.stages.push(stage);
    // Sort by execution order value
    this.stages.sort((a, b) => a.order - b.order);
    this.logger.log(`Registered and sorted pipeline stage: ${stage.id} (Order: ${stage.order})`);
  }

  /**
   * Unregisters a stage from the pipeline by ID.
   */
  removeStage(id: string): boolean {
    const index = this.stages.findIndex(s => s.id === id);
    if (index >= 0) {
      this.stages.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Returns registered stage IDs in order.
   */
  listStages(): string[] {
    return this.stages.map(s => s.id);
  }

  /**
   * Validates stage registration checks during startup.
   */
  validate(): void {
    this.logger.log('Validating pipeline stage ordering and integrity...');
    const ids = this.listStages();
    
    // Check for duplicate execution orders
    const orders = this.stages.map(s => s.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      throw new Error('Pipeline validation failed: Multiple stages claim the same execution order value.');
    }

    // Verify ordering sequence makes sense
    const valIdx = ids.indexOf('validation-stage');
    const detIdx = ids.indexOf('file-detection-stage');
    const toolIdx = ids.indexOf('tool-resolution-stage');
    const parserIdx = ids.indexOf('parser-stage');
    const layoutIdx = ids.indexOf('layout-stage');
    const rendererIdx = ids.indexOf('renderer-stage');
    const respIdx = ids.indexOf('response-stage');

    if (valIdx === -1) throw new Error('Pipeline validation failed: Missing ValidationStage');
    if (parserIdx === -1) throw new Error('Pipeline validation failed: Missing ParserStage');
    if (respIdx === -1) throw new Error('Pipeline validation failed: Missing ResponseStage');

    if (valIdx !== 0) {
      throw new Error('Pipeline validation failed: ValidationStage must be registered first (order 0).');
    }
    
    if (parserIdx < detIdx || parserIdx < toolIdx) {
      throw new Error('Pipeline validation failed: ParserStage must execute after file detection and tool resolution.');
    }

    if (layoutIdx !== -1 && layoutIdx < parserIdx) {
      throw new Error('Pipeline validation failed: LayoutStage must execute after ParserStage.');
    }

    if (rendererIdx !== -1 && rendererIdx < layoutIdx) {
      throw new Error('Pipeline validation failed: RendererStage must execute after LayoutStage.');
    }

    if (respIdx !== ids.length - 1) {
      throw new Error('Pipeline validation failed: ResponseStage must be registered last.');
    }

    this.logger.log('Pipeline configuration validated successfully.');
  }

  /**
   * Executes the pipeline sequentially.
   * Collects stage diagnostics and stops on fatal errors in required stages.
   */
  async execute(context: GenerationContext): Promise<void> {
    this.logger.log(`Starting generation pipeline [${context.requestId}]`);
    
    for (const stage of this.stages) {
      // 1. Initialize diagnostic metadata record
      const diagnostic: StageDiagnostic = {
        stageId: stage.id,
        status: 'pending',
        errors: [],
        warnings: []
      };
      context.stageExecution[stage.id] = diagnostic;

      // 2. Skip if stage is disabled globally
      if (!stage.enabled) {
        diagnostic.status = 'skipped';
        this.logger.debug(`Stage '${stage.id}' skipped (disabled globally)`);
        continue;
      }

      // 3. Skip if stage is not supported by current context parameters
      if (!stage.supports(context)) {
        diagnostic.status = 'skipped';
        this.logger.debug(`Stage '${stage.id}' skipped (unsupported in this context)`);
        continue;
      }

      // 4. Capture telemetry variables and execute
      diagnostic.startTime = new Date().toISOString();
      const startTimeMs = Date.now();
      
      try {
        await stage.execute(context);
        
        diagnostic.status = 'success';
        diagnostic.warnings = [...context.warnings]; // snapshot warnings at this stage
      } catch (err: any) {
        diagnostic.status = 'failed';
        diagnostic.errors = [err.message];
        context.errors.push(`Stage '${stage.id}' failed: ${err.message}`);
        
        this.logger.error(`Execution failed in stage '${stage.id}': ${err.message}`);

        // If stage is required, halt pipeline processing immediately
        if (stage.required) {
          diagnostic.endTime = new Date().toISOString();
          diagnostic.durationMs = Date.now() - startTimeMs;
          this.logger.warn(`Halting pipeline: Stage '${stage.id}' is required and failed.`);
          break;
        }
      } finally {
        diagnostic.endTime = new Date().toISOString();
        diagnostic.durationMs = Date.now() - startTimeMs;
      }
    }
  }
}
