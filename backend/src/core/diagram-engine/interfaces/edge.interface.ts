import { EdgeStyle } from '../types/style.type';

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string; // 'smoothstep', 'straight', 'default', etc.
  label?: string;
  style?: EdgeStyle;
  animated?: boolean;
  data?: Record<string, any>;
}
