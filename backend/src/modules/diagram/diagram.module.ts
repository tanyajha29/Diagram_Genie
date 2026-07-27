import { Module } from '@nestjs/common';
import { DiagramEngineModule } from '../../core/diagram-engine/diagram-engine.module';
import { EngineOrchestrator } from './engine-orchestrator';
import { DiagramGenerationService } from './diagram-generation.service';
import { DiagramController } from './diagram.controller';
import { RendererAdapterRegistry } from './registry/renderer-adapter.registry';
import { ReactFlowAdapter } from './adapters/react-flow.adapter';
import { MermaidAdapter } from './adapters/mermaid.adapter';
import { CytoscapeAdapter } from './adapters/cytoscape.adapter';
import { GenerationPipeline } from './generation-pipeline';
import { AiEnhancementService } from './ai-enhancement.service';

@Module({
  imports: [DiagramEngineModule],
  controllers: [DiagramController],
  providers: [
    EngineOrchestrator,
    DiagramGenerationService,
    RendererAdapterRegistry,
    GenerationPipeline,
    AiEnhancementService,
    // Register renderer adapter plugins
    ReactFlowAdapter,
    MermaidAdapter,
    CytoscapeAdapter,
  ],
})
export class DiagramModule {}
