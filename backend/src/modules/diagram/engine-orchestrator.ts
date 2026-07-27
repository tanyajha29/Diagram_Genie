import { Injectable, Logger, BadRequestException } from '@nestjs/common';
<<<<<<< HEAD
import { 
  GenerationPipeline, 
  GenerationContext, 
  DiagramGenerationResponse 
} from '../../core/diagram-engine/diagram-engine.module';
=======
import { ParserFactory } from '../../core/diagram-engine/factory/parser.factory';
import { ReactFlowGraph } from './adapters/react-flow.adapter';
import { RendererAdapterRegistry } from './registry/renderer-adapter.registry';
import { Diagram, FileDetectionService, DetectedFileType, LayoutRegistry } from '../../core/diagram-engine/diagram-engine.module';
import { AiEnhancementService } from './ai-enhancement.service';
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce

export interface OrchestratorResult {
  diagram: any;
  reactFlow: any;
  detectedType?: string;
  exportedFormats?: Record<string, any>;
}

@Injectable()
export class EngineOrchestrator {
  private readonly logger = new Logger(EngineOrchestrator.name);

<<<<<<< HEAD
  constructor(private readonly pipeline: GenerationPipeline) {
    // Validate stage registration integrity at startup
    this.pipeline.validate();
  }
=======
  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly layoutRegistry: LayoutRegistry,
    private readonly rendererRegistry: RendererAdapterRegistry,
    private readonly fileDetectionService: FileDetectionService,
    private readonly aiEnhancementService: AiEnhancementService
  ) {}
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce

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

<<<<<<< HEAD
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
=======
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
    let diagram = await parser.parse(source, options);

    // 4. AI Enhancement Service (Enhances extracted info and merges outputs)
    this.logger.debug(`Applying AI Enhancement layer...`);
    diagram = await this.aiEnhancementService.enhance(diagram, source, resolvedType, options);

    // 5. Layout Engine Execution (Strategy pattern - resolvable layouts)
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
>>>>>>> fdce0a732d6c96fc85c15858dec625355568c3ce
    };
  }
}
