import { Injectable } from '@nestjs/common';
import { OrchestratorResult } from './engine-orchestrator';
import { GenerateDiagramDto } from './dto/generate-diagram.dto';
import { LayoutRequestDto } from './dto/layout-request.dto';
import { LayoutRegistry, Diagram, AiObservabilityService } from '../../core/diagram-engine/diagram-engine.module';
import { RendererAdapterRegistry } from './registry/renderer-adapter.registry';
import { ReactFlowGraph } from './adapters/react-flow.adapter';
import { CATEGORIES, TOOLS, DiagramCategory, DiagramTool } from './config/catalog';
import { GenerationPipeline } from './generation-pipeline';

@Injectable()
export class DiagramGenerationService {
  constructor(
    private readonly generationPipeline: GenerationPipeline,
    private readonly layoutRegistry: LayoutRegistry,
    private readonly rendererRegistry: RendererAdapterRegistry,
    private readonly observabilityService: AiObservabilityService
  ) {}

  async generate(dto: GenerateDiagramDto): Promise<OrchestratorResult> {
    return this.generationPipeline.execute(dto);
  }

  async applyLayout(dto: LayoutRequestDto): Promise<{ diagram: Diagram; reactFlow: ReactFlowGraph }> {
    const layoutEngine = this.layoutRegistry.getLayout(dto.layoutEngineId.toLowerCase());
    let diagram = dto.diagram;

    if (layoutEngine) {
      diagram = await layoutEngine.layout(diagram, dto.options);
    }

    const reactFlowAdapter = this.rendererRegistry.getAdapter<ReactFlowGraph>('react-flow');
    const reactFlow = reactFlowAdapter ? reactFlowAdapter.adapt(diagram) : { nodes: [], edges: [] };

    return {
      diagram,
      reactFlow
    };
  }

  getTools(): DiagramTool[] {
    return TOOLS;
  }

  getCategories(): DiagramCategory[] {
    return CATEGORIES;
  }

  getAiMetrics() {
    return this.observabilityService.getMetrics();
  }
}
