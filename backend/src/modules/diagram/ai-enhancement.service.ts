import { Injectable, Logger } from '@nestjs/common';
import { AiPipeline, AIManager } from '../../core/ai/ai.module';
import { Diagram } from '../../core/diagram-engine/diagram-engine.module';

@Injectable()
export class AiEnhancementService {
  private readonly logger = new Logger(AiEnhancementService.name);

  constructor(
    private readonly aiPipeline: AiPipeline,
    private readonly aiManager: AIManager
  ) {}

  async enhance(
    diagram: Diagram,
    source: string,
    sourceType: string,
    options?: Record<string, any>
  ): Promise<Diagram> {
    // If AI is disabled or keys are missing, return rule-based diagram immediately
    if (!this.aiManager.isEnabled()) {
      this.logger.log('AI is disabled. Skipping AI enhancement.');
      return diagram;
    }

    try {
      this.logger.log(`Enriching rule-based parser output using AI Pipeline...`);

      // Map sourceType to AI schema categories
      const categoryMapping: Record<string, string> = {
        sql: 'database',
        database: 'database',
        er: 'database',
        markdown: 'architecture',
        md: 'architecture',
        readme: 'architecture',
        flow: 'flow',
        architecture: 'architecture',
        system: 'architecture',
        uml: 'uml',
        cloud: 'cloud',
        api: 'api',
      };

      const category = categoryMapping[sourceType.toLowerCase()] || 'architecture';

      // Run AI pipeline and merge with parsed diagram output
      const enhancedDiagram = await this.aiPipeline.run(
        category,
        'v1',
        { source },
        diagram,
        { abortSignal: options?.abortSignal }
      );

      this.logger.log(`AI enhancement complete. Merged diagram has ${enhancedDiagram.nodes.length} nodes.`);
      return enhancedDiagram;

    } catch (error: any) {
      this.logger.error(`AI enhancement failed: ${error?.message || error}. Falling back to rule-based output.`);
      // Never fail the request because of AI
      return diagram;
    }
  }
}
