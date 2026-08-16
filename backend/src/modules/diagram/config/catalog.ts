import * as engineConfig from './engine_config.json';

export interface DiagramCategory {
  slug: string;
  title: string;
  description: string;
  icon: string;
  popular?: boolean;
}

export interface DiagramTool {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Advanced';
  popular?: boolean;
  recent?: boolean;
}

const iconMapping: Record<string, string> = {
  'software-architecture': 'Network',
  'database-er': 'Database',
  'uml': 'FileCode',
  'flow-process': 'GitFork',
  'cloud-devops': 'Cloud',
  'api-backend': 'Cpu',
  'project-documentation': 'FileText',
  'ai-machine-learning': 'Sparkles'
};

export const CATEGORIES: DiagramCategory[] = engineConfig.engines.map((engine) => ({
  slug: engine.id,
  title: engine.name,
  description: engine.description,
  icon: iconMapping[engine.id] || 'Network',
  popular: true
}));

export const TOOLS: DiagramTool[] = [];

engineConfig.engines.forEach((engine) => {
  engine.presets.forEach((preset) => {
    TOOLS.push({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      category: engine.id,
      level: 'Beginner',
      popular: true,
      recent: false
    });
  });
});
