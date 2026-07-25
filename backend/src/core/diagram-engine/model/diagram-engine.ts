import { Injectable, BadRequestException } from '@nestjs/common';
import { DiagramEngineRegistry } from '../registry/engine.registry';
import { Diagram } from '../interfaces/diagram.interface';

@Injectable()
export class DiagramEngine {
  constructor(private readonly registry: DiagramEngineRegistry) {}

  async generate(
    source: string,
    sourceType: string,
    layoutEngineId?: string,
    options?: Record<string, any>
  ): Promise<Diagram> {
    const parser = this.registry.getParserForType(sourceType);
    if (!parser) {
      throw new BadRequestException(`No parser registered for source type: ${sourceType}`);
    }

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
