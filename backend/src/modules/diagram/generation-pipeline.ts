import { Injectable, Logger } from '@nestjs/common';
import { EngineOrchestrator, OrchestratorResult } from './engine-orchestrator';
import { GenerateDiagramDto } from './dto/generate-diagram.dto';

@Injectable()
export class GenerationPipeline {
  private readonly logger = new Logger(GenerationPipeline.name);

  constructor(private readonly orchestrator: EngineOrchestrator) {}

  async execute(dto: GenerateDiagramDto): Promise<OrchestratorResult> {
    this.logger.log('Executing diagram generation pipeline...');
    return this.orchestrator.orchestrate(
      dto.source,
      dto.sourceType,
      dto.filename,
      dto.mimeType,
      dto.layoutEngineId,
      dto.options
    );
  }
}
