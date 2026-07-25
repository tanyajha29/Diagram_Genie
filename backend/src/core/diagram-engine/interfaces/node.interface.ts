import { Position } from '../types/position.type';
import { NodeStyle } from '../types/style.type';

export interface DiagramNode {
  id: string;
  type: string; // 'rect', 'circle', 'diamond', 'database', etc.
  label: string;
  position: Position;
  data?: Record<string, any>;
  style?: NodeStyle;
  parentId?: string; // Sub-diagram support
  width?: number;
  height?: number;
}
