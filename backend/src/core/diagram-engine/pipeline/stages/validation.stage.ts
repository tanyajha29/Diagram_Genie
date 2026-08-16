import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';

@Injectable()
export class ValidationStage implements PipelineStage {
  readonly id = 'validation-stage';
  readonly order = 10;
  readonly enabled = true;
  readonly required = true;

  supports(context: GenerationContext): boolean {
    return true; // Always execute validation
  }

  async execute(context: GenerationContext): Promise<void> {
    const { source } = context.request;
    
    if (!source || source.trim().length === 0) {
      throw new Error('Input source text/code cannot be empty.');
    }
  }
}
