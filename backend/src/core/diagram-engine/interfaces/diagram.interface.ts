import { DiagramNode } from './node.interface';
import { DiagramEdge } from './edge.interface';
import { DiagramMetadata } from './metadata.interface';
import { Viewport } from './viewport.interface';
import { Theme } from './theme.interface';

export interface Diagram {
  id: string;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata: DiagramMetadata;
  viewport?: Viewport;
  theme?: Theme;
}
