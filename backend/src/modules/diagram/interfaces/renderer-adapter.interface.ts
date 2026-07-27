import { Diagram } from '../../../core/diagram-engine/diagram-engine.module';

export interface IRendererAdapter<TResult = any> {
  readonly id: string;
  adapt(diagram: Diagram): TResult;
}
