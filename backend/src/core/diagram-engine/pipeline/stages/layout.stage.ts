import { Injectable, Logger } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { LayoutRegistry } from '../../layout/registry/layout.registry';

@Injectable()
export class LayoutStage implements PipelineStage {
  readonly id = 'layout-stage';
  readonly order = 50;
  readonly enabled = true;
  readonly required = true;
  private readonly logger = new Logger(LayoutStage.name);

  constructor(private readonly layoutRegistry: LayoutRegistry) {}

  supports(context: GenerationContext): boolean {
    return !!context.diagram;
  }

  async execute(context: GenerationContext): Promise<void> {
    const tool = context.metadata.tool;
    const options = context.request.options || {};
    
    // Check if layout was explicitly overridden by user or fetch tool default
    const layoutId = options.layoutEngineId || (tool ? tool.layoutId : 'grid');

    const layoutEngine = this.layoutRegistry.getLayout(layoutId.toLowerCase());
    
    if (layoutEngine) {
      this.logger.debug(`Applying layout algorithm: ${layoutId}`);
      context.diagram = await layoutEngine.layout(context.diagram!, options);
    } else {
      this.logger.warn(`Layout algorithm '${layoutId}' not found. Defaulting to grid layout.`);
      const fallbackGrid = this.layoutRegistry.getLayout('grid');
      if (fallbackGrid) {
        context.diagram = await fallbackGrid.layout(context.diagram!, options);
      }
    }
  }
}
