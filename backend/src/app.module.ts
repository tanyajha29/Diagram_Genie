import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { LoggerModule } from './core/logger/logger.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigModule, LoggerModule, HealthModule],
})
export class AppModule {}
