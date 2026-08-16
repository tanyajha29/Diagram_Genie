import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { ParserFactory } from '../../factory/parser.factory';

@Injectable()
export class ParserStage implements PipelineStage {
  readonly id = 'parser-stage';
  readonly order = 40;
  readonly enabled = true;
  readonly required = true;

  constructor(private readonly parserFactory: ParserFactory) {}

  supports(context: GenerationContext): boolean {
    return !!context.metadata.tool;
  }

  async execute(context: GenerationContext): Promise<void> {
    const tool = context.metadata.tool;
    const { source, options } = context.request;

    // 1. Resolve parser plugin via factory
    const parser = this.parserFactory.createParser(tool.parserId);

    // 2. Validate input source syntax format
    if (!parser.validate(source)) {
      throw new Error(`Syntax validation failed for parser: ${parser.id}`);
    }

    // 3. Extract logical entities into intermediate Universal Diagram Model
    const result = await parser.parse(source, options);
    context.parserOutput = result.diagram;
    context.diagram = result.diagram; // Initialize diagram structure for downstream layout mutation
    context.warnings.push(...result.warnings);
    context.metadata.parserStatistics = result.statistics;
  }
}
