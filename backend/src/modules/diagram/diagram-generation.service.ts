import { Injectable } from '@nestjs/common';
import { EngineOrchestrator, OrchestratorResult } from './engine-orchestrator';
import { GenerateDiagramDto } from './dto/generate-diagram.dto';

@Injectable()
export class DiagramGenerationService {
  constructor(private readonly orchestrator: EngineOrchestrator) {}

  async generate(dto: GenerateDiagramDto): Promise<OrchestratorResult> {
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
