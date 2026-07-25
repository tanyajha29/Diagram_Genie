import { Diagram } from './diagram.interface';

export interface LayoutEngine {
  id: string;
  layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram>;
}
