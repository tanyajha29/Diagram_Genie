import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PromptTemplate } from './prompt-template';
import { PromptRegistry } from './prompt.registry';

@Injectable()
export class PromptLoader implements OnModuleInit {
  private readonly logger = new Logger(PromptLoader.name);
  private readonly promptsDir = path.join(__dirname, '..', 'templates');

  constructor(private readonly registry: PromptRegistry) {}

  onModuleInit() {
    this.loadPrompts();
  }

  loadPrompts() {
    try {
      if (!fs.existsSync(this.promptsDir)) {
        this.logger.warn(`Prompts templates directory not found at: ${this.promptsDir}. Using default inline configurations.`);
        return;
      }

      const categories = fs.readdirSync(this.promptsDir);
      categories.forEach((category) => {
        const categoryPath = path.join(this.promptsDir, category);
        if (!fs.statSync(categoryPath).isDirectory()) return;

        const files = fs.readdirSync(categoryPath);
        files.forEach((file) => {
          if (!file.endsWith('.md')) return;

          const filePath = path.join(categoryPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const version = path.basename(file, '.md'); // e.g. 'v1'

          try {
            const template = this.parsePromptFile(content, version);
            this.registry.register(category, version, template);
          } catch (e: any) {
            this.logger.error(`Failed to parse prompt template file ${file} in ${category}: ${e?.message}`);
          }
        });
      });
    } catch (error: any) {
      this.logger.error(`Error loading prompt templates from disk: ${error?.message}`);
    }
  }

  private parsePromptFile(content: string, version: string): PromptTemplate {
    // Regular expression captures of System, Developer, and User prompt sections
    const systemMatch = content.match(/#\s+System\s+Prompt\r?\n([\s\S]*?)(?=#\s+Developer\s+Prompt|#\s+User\s+Prompt\s+Template|$)/i);
    const developerMatch = content.match(/#\s+Developer\s+Prompt\r?\n([\s\S]*?)(?=#\s+System\s+Prompt|#\s+User\s+Prompt\s+Template|$)/i);
    const userMatch = content.match(/#\s+User\s+Prompt\s+Template\r?\n([\s\S]*?)(?=#\s+System\s+Prompt|#\s+Developer\s+Prompt|$)/i);

    const systemPrompt = systemMatch ? systemMatch[1].trim() : '';
    const developerPrompt = developerMatch ? developerMatch[1].trim() : '';
    const userPromptTemplate = userMatch ? userMatch[1].trim() : '';

    return new PromptTemplate(version, systemPrompt, developerPrompt, userPromptTemplate);
  }
}
