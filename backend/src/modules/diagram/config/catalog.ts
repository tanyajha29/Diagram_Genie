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

export const CATEGORIES: DiagramCategory[] = [
  {
    slug: 'software-architecture',
    title: 'Software Architecture',
    description: 'Design and visualize system architecture, microservices, and component mappings.',
    icon: 'Network',
    popular: true,
  },
  {
    slug: 'database-engineering',
    title: 'Database Engineering',
    description: 'Model relational databases, design schemas, and visualize foreign key links.',
    icon: 'Database',
    popular: true,
  },
  {
    slug: 'uml',
    title: 'UML Diagrams',
    description: 'Standard UML diagrams including class structures, use cases, and interactions.',
    icon: 'FileCode',
  },
  {
    slug: 'flow-process',
    title: 'Flow & Process',
    description: 'Map workflows, user actions, decision structures, and process charts.',
    icon: 'GitFork',
    popular: true,
  },
  {
    slug: 'cloud-devops',
    title: 'Cloud & DevOps',
    description: 'Visualize AWS, GCP, Azure configurations and Docker container flows.',
    icon: 'Cloud',
    popular: true,
  },
  {
    slug: 'api-backend',
    title: 'API & Backend',
    description: 'Map REST endpoints, requests/responses, and microservice interfaces.',
    icon: 'Cpu',
  },
  {
    slug: 'project-doc',
    title: 'Project Documentation',
    description: 'Generate flow charts and dependency graphs for project planning.',
    icon: 'FileText',
  },
  {
    slug: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Model neural networks, pipeline datasets, and map AI service nodes.',
    icon: 'Sparkles',
  }
];

export const TOOLS: DiagramTool[] = [
  {
    id: 'system-architecture',
    name: 'System Architecture Mapper',
    description: 'Map microservices, load balancers, client layers, and api gateway flows.',
    category: 'software-architecture',
    level: 'Advanced',
    popular: true,
    recent: true
  },
  {
    id: 'database-er',
    name: 'Relational ER Schema',
    description: 'Design database tables, primary/foreign keys, and table relationships.',
    category: 'database-engineering',
    level: 'Advanced',
    popular: true,
    recent: true
  },
  {
    id: 'plain-flowchart',
    name: 'Flowchart Builder',
    description: 'Outline workflow actions, decision checks, and loop pipelines.',
    category: 'flow-process',
    level: 'Beginner',
    popular: true,
    recent: false
  },
  {
    id: 'mindmap-doc',
    name: 'Mindmap Visualizer',
    description: 'Create hierarchical branching maps for project documentation.',
    category: 'project-doc',
    level: 'Beginner',
    popular: false,
    recent: true
  }
];
