import { Module } from '@nestjs/common';
import { DiagramEngineModule } from '../../core/diagram-engine/diagram-engine.module';
import { EngineOrchestrator } from './engine-orchestrator';
import { DiagramGenerationService } from './diagram-generation.service';
import { DiagramController } from './diagram.controller';

@Module({
  imports: [DiagramEngineModule],
  controllers: [DiagramController],
  providers: [EngineOrchestrator, DiagramGenerationService],
})
export class DiagramModule {}
