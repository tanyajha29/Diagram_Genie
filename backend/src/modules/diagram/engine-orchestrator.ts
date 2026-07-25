import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ParserFactory } from '../../core/diagram-engine/factory/parser.factory';
import { DiagramEngineRegistry } from '../../core/diagram-engine/registry/engine.registry';
import { ReactFlowAdapter, ReactFlowGraph } from './adapters/react-flow.adapter';
import { Diagram } from '../../core/diagram-engine/diagram-engine.module';

export interface OrchestratorResult {
  diagram: Diagram;
  reactFlow: ReactFlowGraph;
  exportedFormats?: Record<string, string>;
}

@Injectable()
export class EngineOrchestrator {
  private readonly logger = new Logger(EngineOrchestrator.name);

  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly engineRegistry: DiagramEngineRegistry
  ) {}

  async orchestrate(
    source: string,
    sourceType: string,
    layoutEngineId?: string,
    options?: Record<string, any>
  ): Promise<OrchestratorResult> {
    this.logger.log(`Starting generation orchestration pipeline for type: ${sourceType}`);

    // 1. File Type / Engine Source detection (lowercase normalized)
    const detectedType = sourceType.toLowerCase();

    // 2. Parser Factory matching
    const parser = this.parserFactory.createParser(detectedType);

    // 3. Parser Execution & Request Validation
    this.logger.debug(`Validating source syntax...`);
    if (!parser.validate(source)) {
      throw new BadRequestException(`Syntax validation failed for source type: ${sourceType}`);
    }

    this.logger.debug(`Parsing source elements...`);
    let diagram = await parser.parse(source, options);

    // 4. Layout Engine Execution
    const layoutId = layoutEngineId || 'default';
    const layoutEngine = this.engineRegistry.getLayoutEngine(layoutId);
    if (layoutEngine) {
      this.logger.debug(`Applying layout engine settings: ${layoutId}`);
      diagram = await layoutEngine.layout(diagram, options);
    }

    // 5. React Flow Adaptation
    this.logger.debug(`Adapting diagram output to React Flow nodes...`);
    const reactFlow = ReactFlowAdapter.toReactFlow(diagram);

    // 6. Response Builder Packaging & Future Export Pipeline Hooks
    return {
      diagram,
      reactFlow,
      exportedFormats: {
        mermaid: '%% Export formatting pipeline hook placeholder',
      },
    };
  }
}
