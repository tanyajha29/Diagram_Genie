import { Module } from '@nestjs/common';
import { DiagramEngineModule } from '../../core/diagram-engine/diagram-engine.module';
import { EngineOrchestrator } from './engine-orchestrator';
import { DiagramGenerationService } from './diagram-generation.service';
import { DiagramController } from './diagram.controller';
import { GenerationPipeline } from './generation-pipeline';
import { AiEnhancementService } from './ai-enhancement.service';

@Module({
  imports: [DiagramEngineModule],
  controllers: [DiagramController],
  providers: [
    EngineOrchestrator,
    DiagramGenerationService,
    GenerationPipeline,
    AiEnhancementService,
    // RendererAdapterRegistry + adapter plugins (react-flow, mermaid, cytoscape) are
    // registered in DiagramEngineModule and exported from there — export/rendering is
    // a diagram-engine concern shared by both the legacy orchestrator and the
    // stage-based pipeline, so it lives in one place rather than being duplicated here.
  ],
})
export class DiagramModule {}
