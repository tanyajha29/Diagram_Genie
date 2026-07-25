import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { LoggerModule } from './core/logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { DiagramEngineModule } from './core/diagram-engine/diagram-engine.module';
import { DiagramModule } from './modules/diagram/diagram.module';

@Module({
  imports: [ConfigModule, LoggerModule, HealthModule, DiagramEngineModule, DiagramModule],
})
export class AppModule {}
