import { Injectable, Logger } from '@nestjs/common';
import { PromptTemplate } from './prompt-template';

@Injectable()
export class PromptRegistry {
  private readonly templates = new Map<string, Map<string, PromptTemplate>>();
  private readonly logger = new Logger(PromptRegistry.name);

  constructor() {
    this.registerDefaultTemplates();
  }

  register(category: string, version: string, template: PromptTemplate): void {
    const cat = category.toLowerCase();
    const ver = version.toLowerCase();

    if (!this.templates.has(cat)) {
      this.templates.set(cat, new Map());
    }

    this.templates.get(cat)!.set(ver, template);
    this.logger.log(`Registered Prompt Template: [${cat}] version: [${ver}]`);
  }

  getTemplate(category: string, version: string = 'v1'): PromptTemplate | undefined {
    return this.templates.get(category.toLowerCase())?.get(version.toLowerCase());
  }

  private registerDefaultTemplates() {
    // Default architecture v1 template
    this.register(
      'architecture',
      'v1',
      new PromptTemplate(
        'v1',
        'You are an expert systems architect. Analyze the requirements and extract components and connections.',
        'Return ONLY a parseable JSON object matching the requested schema.',
        'Analyze the following system architecture requirements:\n"""\n{{source}}\n"""'
      )
    );
  }
}
