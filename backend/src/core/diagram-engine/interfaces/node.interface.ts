import { Position } from '../types/position.type';
import { NodeStyle } from '../types/style.type';

/**
 * Represent a logical node inside the Universal Diagram Model.
 * This structure is entirely independent of downstream layout systems
 * and specific renderer formats (e.g. React Flow).
 */
export interface DiagramNode {
  /** Unique node identifier */
  id: string;
  
  /** Logical visual type (e.g. 'database', 'cloud', 'decision') */
  type: string;
  
  /** Human-readable node label */
  label: string;
  
  /** Absolute coordinates of the node relative to the canvas origin */
  position: Position;
  
  /** Extensible key-value metadata container */
  data?: Record<string, any>;
  
  /** Node custom styling overrides */
  style?: NodeStyle;
  
  /** Parent node identifier for nested sub-diagram scopes */
  parentId?: string;
  
  /** Explicit element bounding width */
  width?: number;
  
  /** Explicit element bounding height */
  height?: number;

  columns?: any[];
  properties?: Record<string, string>;
  methods?: any[];
  attributes?: string[];
}
