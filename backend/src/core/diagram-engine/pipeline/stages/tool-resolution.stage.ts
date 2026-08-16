import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { ToolRegistry } from '../../tool-registry/tool.registry';

@Injectable()
export class ToolResolutionStage implements PipelineStage {
  readonly id = 'tool-resolution-stage';
  readonly order = 30;
  readonly enabled = true;
  readonly required = true;

  constructor(private readonly toolRegistry: ToolRegistry) {}

  supports(context: GenerationContext): boolean {
    return true; // Always resolve tool
  }

  async execute(context: GenerationContext): Promise<void> {
    const { filename, mimeType, sourceType, source } = context.request;
    const ext = filename ? filename.split('.').pop() : undefined;

    const tool = this.toolRegistry.resolveBestTool({
      extension: ext,
      mimeType,
      detectedFileType: context.detectedFileType,
      parserType: sourceType,
      content: source,
    });

    if (!tool) {
      throw new Error('No suitable active tool definition found mapping to input criteria.');
    }

    context.selectedTool = tool.id;
    context.metadata.tool = tool; // Cache tool reference in metadata dictionary for downstream stages
  }
}
