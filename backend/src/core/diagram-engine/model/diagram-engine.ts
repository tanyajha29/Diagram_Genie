import { Injectable, BadRequestException } from '@nestjs/common';
import { ParserFactory } from '../factory/parser.factory';
import { DiagramEngineRegistry } from '../registry/engine.registry';
import { Diagram } from '../interfaces/diagram.interface';

@Injectable()
export class DiagramEngine {
  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly registry: DiagramEngineRegistry
  ) {}

  async generate(
    source: string,
    sourceType: string,
    layoutEngineId?: string,
    options?: Record<string, any>
  ): Promise<Diagram> {
    // Request a parser from the registry via factory
    const parser = this.parserFactory.createParser(sourceType);

    // Validate the input code syntax
    if (!parser.validate(source)) {
      throw new BadRequestException(`Validation failed: Invalid syntax for ${sourceType} parsing.`);
    }

    // Compile syntax into node models
    let diagram = await parser.parse(source, options);

    // Apply layout if engine is specified or if a default exists
    const layoutId = layoutEngineId || 'default';
    const layoutEngine = this.registry.getLayoutEngine(layoutId);
    if (layoutEngine) {
      diagram = await layoutEngine.layout(diagram, options);
    }

    return diagram;
  }
}
