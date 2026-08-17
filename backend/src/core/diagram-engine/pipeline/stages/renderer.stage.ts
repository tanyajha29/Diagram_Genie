import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { RendererAdapterRegistry } from '../../../../modules/diagram/registry/renderer-adapter.registry';

@Injectable()
export class RendererStage implements PipelineStage {
  readonly id = 'renderer-stage';
  readonly order = 60;
  readonly enabled = true;
  readonly required = true;

  constructor(private readonly rendererRegistry: RendererAdapterRegistry) {}

  supports(context: GenerationContext): boolean {
    return !!context.diagram;
  }

  async execute(context: GenerationContext): Promise<void> {
    const reactFlowAdapter = this.rendererRegistry.getAdapter('react-flow');
    if (!reactFlowAdapter) {
      throw new Error('Critical Error: React Flow Renderer Adapter is not registered.');
    }

    // Translate positioned UDM coordinates model to React Flow canvas nodes/edges format
    context.rendererOutput = reactFlowAdapter.adapt(context.diagram!);

    // Populate any other registered export formats (e.g. mermaid, cytoscape) dynamically
    const exportedFormats: Record<string, any> = {};
    this.rendererRegistry.getAdapters().forEach((adapter) => {
      if (adapter.id !== 'react-flow') {
        try {
          exportedFormats[adapter.id] = adapter.adapt(context.diagram!);
        } catch (err: any) {
          context.warnings.push(`Failed to execute exporter adapter '${adapter.id}': ${err?.message}`);
        }
      }
    });
    context.metadata.exportedFormats = exportedFormats;
  }
}
