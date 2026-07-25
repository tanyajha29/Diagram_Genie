import { Module } from '@nestjs/common';
import { DiagramEngineRegistry } from './registry/engine.registry';
import { ParserRegistry } from './registry/parser.registry';
import { ParserFactory } from './factory/parser.factory';
import { DiagramEngine } from './model/diagram-engine';
import { SqlParser } from './parsers/sql.parser';
import { MarkdownParser } from './parsers/markdown.parser';
import { ArchitectureParser } from './parsers/architecture.parser';
import { DefaultLayoutEngine } from './layout/default-layout.engine';

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
