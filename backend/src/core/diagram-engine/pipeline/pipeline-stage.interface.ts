import { GenerationContext } from '../context/generation.context';

/**
 * Interface contract for all modular processing stages in the generation pipeline.
 */
export interface PipelineStage {
  /** Unique stage identifier (e.g. 'validation-stage', 'layout-stage') */
  readonly id: string;
  
  /** Execution order rank (smaller numbers execute first) */
  readonly order: number;
  
  /** Global enabled status of the stage */
  readonly enabled: boolean;
  
  /** Indicates if a failure in this stage halts the pipeline */
  readonly required: boolean;

  /**
   * Evaluates if this stage supports executing based on the current context properties.
   * Useful for conditional stages (e.g. tool-specific parsing or layout overrides).
   */
  supports(context: GenerationContext): boolean;

  /**
   * Executes the stage's processing logic, mutating the shared GenerationContext.
   */
  execute(context: GenerationContext): Promise<void>;
}
