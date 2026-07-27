import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ParserFactory } from '../../core/diagram-engine/factory/parser.factory';
import { ReactFlowAdapter, ReactFlowGraph } from './adapters/react-flow.adapter';
import { Diagram, FileDetectionService, DetectedFileType, LayoutRegistry } from '../../core/diagram-engine/diagram-engine.module';

export interface OrchestratorResult {
  diagram: Diagram;
  reactFlow: ReactFlowGraph;
  detectedType?: string;
  exportedFormats?: Record<string, string>;
}

@Injectable()
export class EngineOrchestrator {
  private readonly logger = new Logger(EngineOrchestrator.name);

  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly layoutRegistry: LayoutRegistry,
    private readonly fileDetectionService: FileDetectionService
  ) {}

  async orchestrate(
    source: string,
    sourceType?: string,
    filename?: string,
    mimeType?: string,
    layoutEngineId?: string,
    options?: Record<string, any>
  ): Promise<OrchestratorResult> {
    this.logger.log(`Starting generation orchestration pipeline`);

    // 1. File Type / Engine Source detection (backend decides)
    let detected: DetectedFileType;
    let resolvedType = sourceType;

    if (!resolvedType) {
      detected = this.fileDetectionService.detect(filename, mimeType, source);
      
      const typeMapping: Record<DetectedFileType, string> = {
        [DetectedFileType.README]: 'markdown',
        [DetectedFileType.MARKDOWN]: 'markdown',
        [DetectedFileType.SQL]: 'sql',
        [DetectedFileType.PRISMA]: 'sql',
        [DetectedFileType.DOCKER_COMPOSE]: 'architecture',
        [DetectedFileType.TERRAFORM]: 'architecture',
        [DetectedFileType.OPENAPI]: 'architecture',
        [DetectedFileType.YAML]: 'architecture',
        [DetectedFileType.JSON]: 'architecture',
        [DetectedFileType.PLAIN_TEXT]: 'architecture',
      };
      
      resolvedType = typeMapping[detected] || 'architecture';
      this.logger.log(`Auto-resolved parser type: ${resolvedType} from file category: ${detected}`);
    } else {
      detected = DetectedFileType.PLAIN_TEXT;
    }

    // 2. Parser Factory matching
    const parser = this.parserFactory.createParser(resolvedType.toLowerCase());

    // 3. Parser Execution & Request Validation
    this.logger.debug(`Validating source syntax...`);
    if (!parser.validate(source)) {
      throw new BadRequestException(`Syntax validation failed for parser: ${parser.id}`);
    }

    this.logger.debug(`Parsing source elements...`);
    let diagram = await parser.parse(source, options);

    // 4. Layout Engine Execution (Strategy pattern - resolvable layouts)
    const layoutId = layoutEngineId || 'grid';
    const layoutEngine = this.layoutRegistry.getLayout(layoutId.toLowerCase());
    
    if (layoutEngine) {
      this.logger.debug(`Applying layout algorithm: ${layoutId}`);
      diagram = await layoutEngine.layout(diagram, options);
    } else {
      this.logger.warn(`Layout algorithm '${layoutId}' not found. Defaulting to grid layout.`);
      const fallbackGrid = this.layoutRegistry.getLayout('grid');
      if (fallbackGrid) {
        diagram = await fallbackGrid.layout(diagram, options);
      }
    }

    // 5. React Flow Adaptation
    this.logger.debug(`Adapting diagram output to React Flow nodes...`);
    const reactFlow = ReactFlowAdapter.toReactFlow(diagram);

    // 6. Response Builder Packaging & Future Export Pipeline Hooks
    return {
      diagram,
      reactFlow,
      detectedType: detected,
      exportedFormats: {
        mermaid: '%% Export formatting pipeline hook placeholder',
      },
    };
  }
}
