import { Module } from '@nestjs/common';
import { DiagramEngineRegistry } from './registry/engine.registry';
import { ParserRegistry } from './registry/parser.registry';
import { ParserFactory } from './factory/parser.factory';
import { DiagramEngine } from './model/diagram-engine';
import { SqlParser } from './parsers/sql.parser';
import { MarkdownParser } from './parsers/markdown.parser';
import { ArchitectureParser } from './parsers/architecture.parser';

@Module({
  providers: [
    DiagramEngineRegistry,
    ParserRegistry,
    ParserFactory,
    DiagramEngine,
    // Register parser plugins (constructors will self-register with ParserRegistry on DI init)
    SqlParser,
    MarkdownParser,
    ArchitectureParser,
  ],
  exports: [
    DiagramEngineRegistry,
    ParserRegistry,
    ParserFactory,
    DiagramEngine,
  ],
})
export class DiagramEngineModule {}

export type { Diagram, DiagramNode, DiagramEdge, DiagramMetadata, Viewport, Theme } from './interfaces';
export type { IParser } from './interfaces/parser.interface';
export type { Position } from './types/position.type';
export type { NodeStyle, EdgeStyle } from './types/style.type';
export { DiagramUtils } from './utils/diagram.utils';
