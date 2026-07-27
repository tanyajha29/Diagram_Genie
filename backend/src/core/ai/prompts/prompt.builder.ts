import { Injectable, NotFoundException } from '@nestjs/common';
import { PromptRegistry } from './prompt.registry';

@Injectable()
export class PromptBuilder {
  constructor(private readonly registry: PromptRegistry) {}

  build(
    category: string,
    version: string,
    placeholders: Record<string, string>
  ): { system: string; developer: string; user: string } {
    const template = this.registry.getTemplate(category, version);
    if (!template) {
      throw new NotFoundException(`Prompt template not found for category '${category}' and version '${version}'`);
    }

    return template.build(placeholders);
  }
}
