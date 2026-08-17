import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';
import { pino } from 'pino';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const origins = corsOrigin ? corsOrigin.split(',') : '*';

  // Enable CORS for frontend cross-origin requests
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // Use nestjs-pino logger
  const logger = app.get(PinoLogger);
  app.useLogger(logger);

  // Enable API prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix, { exclude: ['/'] });

  // Enable URI-based versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Configure global exception filter (injecting root pino logger)
  const rootLogger = pino();
  app.useGlobalFilters(new HttpExceptionFilter(rootLogger));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('I ❤️ Diagram API')
    .setDescription('Production-grade API documentation for I ❤️ Diagram AI-powered generation platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Start application
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}/v1`);
  logger.log(`📖 API Documentation is available on: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
