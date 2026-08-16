import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ParserFactory } from '../../core/diagram-engine/factory/parser.factory';
import { ReactFlowGraph } from './adapters/react-flow.adapter';
import { RendererAdapterRegistry } from './registry/renderer-adapter.registry';
import { Diagram, FileDetectionService, DetectedFileType, LayoutRegistry } from '../../core/diagram-engine/diagram-engine.module';
import { AiEnhancementService } from './ai-enhancement.service';

export interface OrchestratorResult {
  diagram: any;
  reactFlow: any;
  detectedType?: string;
  exportedFormats?: Record<string, any>;
  warnings?: string[];
}

@Injectable()
export class EngineOrchestrator {
  private readonly logger = new Logger(EngineOrchestrator.name);

  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly layoutRegistry: LayoutRegistry,
    private readonly rendererRegistry: RendererAdapterRegistry,
    private readonly fileDetectionService: FileDetectionService,
    private readonly aiEnhancementService: AiEnhancementService
  ) {}

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

    // 2. Parser Factory matching (Strategy Pattern - Rule-Based Parser)
    const parser = this.parserFactory.createParser(resolvedType.toLowerCase());

    // 3. Parser Execution & Request Validation
    this.logger.debug(`Validating source syntax...`);
    if (!parser.validate(source)) {
      throw new BadRequestException(`Syntax validation failed for parser: ${parser.id}`);
    }

    this.logger.debug(`Parsing source elements (Rule-Based Parser)...`);
    const parserResult = await parser.parse(source, options);
    let diagram: Diagram = parserResult.diagram;
    const warnings = [...parserResult.warnings];

    if (warnings.length > 0) {
      this.logger.warn(`Parser '${parser.id}' produced ${warnings.length} warning(s): ${warnings.join('; ')}`);
    }

    // 4. AI Enhancement Service (Enhances extracted info and merges outputs)
    this.logger.debug(`Applying AI Enhancement layer...`);
    diagram = await this.aiEnhancementService.enhance(diagram, source, resolvedType, options);

    // 5. Layout Engine Execution (Strategy pattern - resolvable layouts)
    // Mindmaps read poorly with a generic grid, so default them to the radial
    // layout unless the caller explicitly asked for something else.
    const defaultLayoutForType: Record<string, string> = {
      mindmap: 'radial',
    };
    const layoutId = layoutEngineId || defaultLayoutForType[resolvedType.toLowerCase()] || 'grid';
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

    // 6. Renderer Adapters adaptation (Strategy pattern - resolvable UI mappings)
    this.logger.debug(`Adapting diagram output to target rendering representations...`);

    // Resolve primary React Flow graph
    const reactFlowAdapter = this.rendererRegistry.getAdapter<ReactFlowGraph>('react-flow');
    if (!reactFlowAdapter) {
      throw new Error('Critical Error: React Flow Renderer Adapter is not registered.');
    }
    const reactFlow = reactFlowAdapter.adapt(diagram);

    // Populate all other registered formats (e.g. mermaid, cytoscape) dynamically
    const exportedFormats: Record<string, any> = {};
    this.rendererRegistry.getAdapters().forEach((adapter) => {
      if (adapter.id !== 'react-flow') {
        try {
          exportedFormats[adapter.id] = adapter.adapt(diagram);
        } catch (err: any) {
          this.logger.error(`Failed to execute exporter adapter '${adapter.id}': ${err?.message}`);
        }
      }
    });

    // 7. Response Builder Packaging
    return {
      diagram,
      reactFlow,
      detectedType: detected,
      exportedFormats,
      warnings,
    };
  }
}
