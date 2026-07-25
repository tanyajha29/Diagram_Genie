import { Module } from '@nestjs/common';
import { DiagramEngineRegistry } from './registry/engine.registry';
import { DiagramEngine } from './model/diagram-engine';

@Module({
  providers: [DiagramEngineRegistry, DiagramEngine],
  exports: [DiagramEngineRegistry, DiagramEngine],
})
export class DiagramEngineModule {}

export type { Diagram, DiagramNode, DiagramEdge, DiagramMetadata, Viewport, Theme } from './interfaces';
export type { Position } from './types/position.type';
export type { NodeStyle, EdgeStyle } from './types/style.type';
export { DiagramUtils } from './utils/diagram.utils';
