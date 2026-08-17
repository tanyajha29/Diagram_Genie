import engineConfig from './engine_config.json';

export interface ToolConfig {
  id: string;
  name: string;
  category: 'Architecture' | 'Database' | 'UML' | 'Flow' | 'Cloud' | 'API & Backend' | 'Project Documentation' | 'AI & ML';
  icon: string;
  description: string;
  supportedInputs: string[];
  supportedOutputs: string[];
  sampleData: string;
  parserType: 'architecture' | 'er' | 'uml' | 'flowchart' | 'mindmap' | 'cloud';
  isPopular?: boolean;
  isRecent?: boolean;
  level?: 'Beginner' | 'Advanced';
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  toolCount: number;
}

const categoryMapping: Record<string, { name: string; categoryName: ToolConfig['category']; icon: string }> = {
  'software-architecture': { name: 'Software Architecture', categoryName: 'Architecture', icon: '🏗' },
  'database-er': { name: 'Database Engineering', categoryName: 'Database', icon: '🗄' },
  'uml': { name: 'UML Diagrams', categoryName: 'UML', icon: '📦' },
  'flow-process': { name: 'Flow & Process', categoryName: 'Flow', icon: '🔄' },
  'cloud-devops': { name: 'Cloud & DevOps', categoryName: 'Cloud', icon: '☁' },
  'api-backend': { name: 'API & Backend', categoryName: 'API & Backend', icon: '🔌' },
  'project-documentation': { name: 'Project Documentation', categoryName: 'Project Documentation', icon: '📄' },
  'ai-machine-learning': { name: 'AI & ML', categoryName: 'AI & ML', icon: '🤖' }
};

export const categoriesConfig: CategoryConfig[] = engineConfig.engines.map((engine) => {
  const mapping = categoryMapping[engine.id] || { name: engine.name, icon: '🏗' };
  return {
    id: engine.id,
    name: mapping.name,
    icon: mapping.icon,
    description: engine.description,
    toolCount: engine.presets.length
  };
});

const getParserType = (parserName: string): ToolConfig['parserType'] => {
  switch (parserName) {
    case 'sql':
    case 'prisma':
      return 'er';
    case 'uml':
    case 'sequence':
      return 'uml';
    case 'flowchart':
      return 'flowchart';
    case 'markdown-outline':
      return 'mindmap';
    case 'cloud':
    case 'terraform':
    case 'docker-compose':
      return 'cloud';
    default:
      return 'architecture';
  }
};

export const toolsConfig: ToolConfig[] = [];

engineConfig.engines.forEach((engine) => {
  const mapping = categoryMapping[engine.id] || { categoryName: 'Architecture' };
  const supportedInputs = engine.formats.map((f) => f.label);
  const supportedOutputs = ['PNG', 'SVG', 'PDF', 'JSON'];
  
  const firstFormat = engine.formats[0];
  const parserType = firstFormat ? getParserType(firstFormat.parser) : 'architecture';

  engine.presets.forEach((preset) => {
    toolsConfig.push({
      id: preset.id,
      name: preset.name,
      category: mapping.categoryName,
      icon: 'Layers',
      description: preset.description,
      supportedInputs,
      supportedOutputs,
      sampleData: preset.sampleData,
      parserType,
      isPopular: true,
      level: 'Beginner'
    });
  });
});
export { engineConfig };
