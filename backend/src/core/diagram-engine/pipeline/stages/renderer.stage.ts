import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { ReactFlowAdapter } from '../../../../modules/diagram/adapters/react-flow.adapter';


@Injectable()
export class RendererStage implements PipelineStage {
  readonly id = 'renderer-stage';
  readonly order = 60;
  readonly enabled = true;
  readonly required = true;

  supports(context: GenerationContext): boolean {
    return !!context.diagram;
  }

  async execute(context: GenerationContext): Promise<void> {
    // Translate positioned UDM coordinates model to React Flow canvas nodes/edges format
    context.rendererOutput = ReactFlowAdapter.toReactFlow(context.diagram!);
  }
}
