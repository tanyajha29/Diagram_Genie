import { Module } from '@nestjs/common';
import { DiagramEngineRegistry } from './registry/engine.registry';
import { ParserRegistry } from './registry/parser.registry';
import { ParserFactory } from './factory/parser.factory';
import { DiagramEngine } from './model/diagram-engine';
import { SqlParser } from './parsers/sql.parser';
import { MarkdownParser } from './parsers/markdown.parser';
import { ArchitectureParser } from './parsers/architecture.parser';
import { DefaultLayoutEngine } from './layout/default-layout.engine';

// File Detector imports
import { FileDetectorRegistry } from './file-detector/registry/file-detector.registry';
import { FileDetectionService } from './file-detector/file-detection.service';
import { DockerComposeDetector } from './file-detector/detectors/docker-compose.detector';
import { OpenApiDetector } from './file-detector/detectors/openapi.detector';
import { TerraformDetector } from './file-detector/detectors/terraform.detector';
import { PrismaDetector } from './file-detector/detectors/prisma.detector';
import { ReadmeDetector } from './file-detector/detectors/readme.detector';
import { MarkdownDetector } from './file-detector/detectors/markdown.detector';
import { SqlDetector } from './file-detector/detectors/sql.detector';
import { JsonDetector } from './file-detector/detectors/json.detector';
import { YamlDetector } from './file-detector/detectors/yaml.detector';

@Module({
  providers: [
    DiagramEngineRegistry,
    ParserRegistry,
    ParserFactory,
    DiagramEngine,
    // Register parser plugins
    SqlParser,
    MarkdownParser,
    ArchitectureParser,
    // Register layout engines
    DefaultLayoutEngine,
    // Register file detection services
    FileDetectorRegistry,
    FileDetectionService,
    DockerComposeDetector,
    OpenApiDetector,
    TerraformDetector,
    PrismaDetector,
    ReadmeDetector,
    MarkdownDetector,
    SqlDetector,
    JsonDetector,
    YamlDetector,
  ],
  exports: [
    DiagramEngineRegistry,
    ParserRegistry,
    ParserFactory,
    DiagramEngine,
    FileDetectionService,
  ],
})
export class DiagramEngineModule {}

export type { Diagram, DiagramNode, DiagramEdge, DiagramMetadata, Viewport, Theme } from './interfaces';
export type { IParser } from './interfaces/parser.interface';
export type { Position } from './types/position.type';
export type { NodeStyle, EdgeStyle } from './types/style.type';
export { DiagramUtils } from './utils/diagram.utils';
export { DetectedFileType } from './file-detector/types/file-type.enum';
export { FileDetectionService } from './file-detector/file-detection.service';
