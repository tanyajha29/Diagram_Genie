import { Diagram } from '../../interfaces/diagram.interface';

export interface ILayout {
  readonly id: string;
  layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram>;
}
