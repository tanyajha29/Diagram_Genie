import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ToolDefinition } from './tool.definition';
import { CapabilityRegistry } from './capability.registry';
import { ParserRegistry } from '../registry/parser.registry';
import { LayoutRegistry } from '../layout/registry/layout.registry';

@Injectable()
export class ToolRegistry implements OnModuleInit {
  private readonly tools = new Map<string, ToolDefinition>();
  private readonly logger = new Logger(ToolRegistry.name);

  constructor(
    private readonly capabilityRegistry: CapabilityRegistry,
    private readonly parserRegistry: ParserRegistry,
    private readonly layoutRegistry: LayoutRegistry
  ) {}

  onModuleInit() {
    this.bootstrapCapabilities();
    this.bootstrapTools();
    this.validateRegistry();
  }

  /**
   * Registers a new tool definition.
   * Throws an error on duplicate tool ID or duplicate alias.
   */
  register(tool: ToolDefinition): void {
    const idKey = tool.id.toLowerCase();
    if (this.tools.has(idKey)) {
      throw new Error(`Startup validation failed: Duplicate tool registration detected for ID '${tool.id}'`);
    }

    // Check for alias duplicates within registered tools
    const allTools = this.getAll();
    for (const alias of tool.aliases) {
      const aliasKey = alias.toLowerCase();
      const duplicate = allTools.find(t => 
        t.id.toLowerCase() === aliasKey || 
        t.aliases.map(a => a.toLowerCase()).includes(aliasKey)
      );
      if (duplicate) {
        throw new Error(`Startup validation failed: Duplicate alias '${alias}' in tool '${tool.id}' conflicts with '${duplicate.id}'`);
      }
    }

    this.tools.set(idKey, tool);
    this.logger.log(`Registered tool: ${tool.name} (${tool.id})`);
  }

  /**
   * Unregisters a tool definition.
   */
  unregister(id: string): boolean {
    return this.tools.delete(id.toLowerCase());
  }

  /**
   * Replaces or updates an existing tool definition.
   */
  update(tool: ToolDefinition): void {
    const idKey = tool.id.toLowerCase();
    if (!this.tools.has(idKey)) {
      throw new Error(`Cannot update tool: '${tool.id}' is not registered.`);
    }
    this.tools.set(idKey, tool);
    this.logger.log(`Updated tool registration: ${tool.name} (${tool.id})`);
  }

  /**
   * Checks if a tool with the specified ID exists in the registry.
   */
  exists(id: string): boolean {
    return this.tools.has(id.toLowerCase());
  }

  /**
   * Retrieves a tool definition by ID or alias.
   */
  get(id: string): ToolDefinition | undefined {
    const key = id.toLowerCase();
    const directMatch = this.tools.get(key);
    if (directMatch) return directMatch;

    // Search by alias
    return this.getAll().find(t => 
      t.aliases.map(a => a.toLowerCase()).includes(key)
    );
  }

  /**
   * Returns all registered tools.
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Returns all tools registered under a category (case-insensitive).
   */
  getByCategory(category: string): ToolDefinition[] {
    const lowerCat = category.toLowerCase();
    return this.getAll().filter(t => t.category.toLowerCase() === lowerCat);
  }

  /**
   * Returns all tools that claim a capability ID (case-insensitive).
   */
  getByCapability(capabilityId: string): ToolDefinition[] {
    const lowerCap = capabilityId.toLowerCase();
    return this.getAll().filter(t => 
      t.capabilities.map(c => c.toLowerCase()).includes(lowerCap)
    );
  }

  /**
   * Returns all tools mapped to a specific parser service ID.
   */
  getByParser(parserId: string): ToolDefinition[] {
    return this.getAll().filter(t => t.parserId === parserId);
  }

  /**
   * Resolves a tool that claims support for a file extension.
   */
  resolveByFileExtension(ext: string): ToolDefinition | undefined {
    const cleanExt = ext.toLowerCase().replace(/^\./, '');
    return this.getAll()
      .filter(t => t.enabled && t.supportedFileExtensions.map(e => e.toLowerCase()).includes(cleanExt))
      .sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * Resolves a tool that claims support for a MIME type.
   */
  resolveByMimeType(mime: string): ToolDefinition | undefined {
    const cleanMime = mime.toLowerCase();
    return this.getAll()
      .filter(t => t.enabled && t.supportedMimeTypes.map(m => m.toLowerCase()).includes(cleanMime))
      .sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * Resolves a tool by checking if the content string matches any registered content pattern.
   */
  resolveByContent(content: string): ToolDefinition | undefined {
    const cleanContent = content.toLowerCase();
    return this.getAll()
      .filter(t => t.enabled && t.supportedContentPatterns.some(pat => cleanContent.includes(pat.toLowerCase())))
      .sort((a, b) => b.priority - a.priority)[0];
  }

  /**
   * Diagnoses and resolves the best matching tool definition based on cascading metadata rules.
   */
  resolveBestTool(criteria: {
    extension?: string;
    mimeType?: string;
    detectedFileType?: string;
    parserType?: string;
    content?: string;
  }): ToolDefinition | undefined {
    // 1. Resolve by explicit parserType (matches ID, alias, or tag)
    if (criteria.parserType) {
      const match = this.get(criteria.parserType);
      if (match && match.enabled) return match;

      // Tag lookup
      const tagMatch = this.getAll().find(t => 
        t.enabled && t.tags.map(tag => tag.toLowerCase()).includes(criteria.parserType!.toLowerCase())
      );
      if (tagMatch) return tagMatch;
    }

    // 2. Resolve by content patterns
    if (criteria.content) {
      const match = this.resolveByContent(criteria.content);
      if (match) return match;
    }

    // 3. Resolve by file extension
    if (criteria.extension) {
      const match = this.resolveByFileExtension(criteria.extension);
      if (match) return match;
    }

    // 4. Resolve by MIME type
    if (criteria.mimeType) {
      const match = this.resolveByMimeType(criteria.mimeType);
      if (match) return match;
    }

    // 5. Resolve by detected file type metadata tag (matches detected file enum tag lowercase)
    if (criteria.detectedFileType) {
      const match = this.getAll().find(t => 
        t.enabled && t.tags.map(tag => tag.toLowerCase()).includes(criteria.detectedFileType!.toLowerCase())
      );
      if (match) return match;
    }

    // Fallback: Default to first enabled tool (e.g. Architecture Diagram)
    return this.getAll().find(t => t.enabled);
  }

  /**
   * DIAGNOSTIC: List all registered tools in the system.
   */
  listTools(): ToolDefinition[] {
    return this.getAll();
  }

  /**
   * DIAGNOSTIC: List all capabilities registered in the capability registry.
   */
  listCapabilities() {
    return this.capabilityRegistry.getAll();
  }

  /**
   * Startup registry integrity validation checks.
   * Ensures parser, layout, and capability metadata targets are valid and configured.
   */
  validateRegistry(): void {
    this.logger.log('Starting Tool Registry integrity diagnostics...');
    const allTools = this.getAll();

    for (const tool of allTools) {
      // 1. Validate capability mappings exist
      for (const capId of tool.capabilities) {
        if (!this.capabilityRegistry.exists(capId)) {
          throw new Error(`Startup validation failed: Tool '${tool.id}' references unregistered capability '${capId}'`);
        }
      }

      // Validate parser and layout configuration for ENABLED tools
      if (tool.enabled) {
        // 2. Verify Parser exists
        const parserExists = this.parserRegistry.getParsers().some(p => 
          p.id === tool.parserId || p.supports(tool.parserId)
        );
        if (!parserExists) {
          throw new Error(`Startup validation failed: Enabled Tool '${tool.id}' requires parser ID '${tool.parserId}' which is not registered.`);
        }

        // 3. Verify Layout engine exists
        const layoutExists = this.layoutRegistry.getLayouts().some(l => l.id === tool.layoutId) || tool.layoutId === 'default';
        if (!layoutExists) {
          throw new Error(`Startup validation failed: Enabled Tool '${tool.id}' requires layout ID '${tool.layoutId}' which is not registered.`);
        }
      }
    }
    this.logger.log('Tool Registry validation succeeded. All active configurations are sound.');
  }

  private bootstrapCapabilities(): void {
    const initialCaps = [
      { id: 'architecture', displayName: 'Architecture', description: 'Software and systems architecture mapping', category: 'Software Design' },
      { id: 'database', displayName: 'Database', description: 'Relational database designs and schemas', category: 'Storage' },
      { id: 'flowchart', displayName: 'Flowchart', description: 'Procedural flow and logic mapping', category: 'Business Process' },
      { id: 'sequence', displayName: 'Sequence', description: 'UML sequence messages and actors interaction', category: 'UML' },
      { id: 'class', displayName: 'Class', description: 'UML class properties and associations', category: 'UML' },
      { id: 'erd', displayName: 'ERD', description: 'Entity-relationship diagrams for databases', category: 'Storage' },
      { id: 'activity', displayName: 'Activity', description: 'UML activity node maps and choices', category: 'UML' },
      { id: 'usecase', displayName: 'Use Case', description: 'UML use cases and actor boundaries', category: 'UML' },
      { id: 'component', displayName: 'Component', description: 'UML component packages and boundaries', category: 'UML' },
      { id: 'deployment', displayName: 'Deployment', description: 'UML physical node maps and execution environments', category: 'UML' },
      { id: 'api', displayName: 'API', description: 'Backend HTTP routes and network topologies', category: 'API & Backend' },
      { id: 'documentation', displayName: 'Documentation', description: 'Document structures and lists', category: 'Project Management' },
      { id: 'mindmap', displayName: 'Mind Map', description: 'Indented tree node mind mapping', category: 'Flow & Mindmap' },
      { id: 'timeline', displayName: 'Timeline', description: 'Chronological events and project milestones', category: 'Project Management' },
      { id: 'aiml', displayName: 'AI / ML', description: 'Artificial Intelligence pipelines and neural weights', category: 'Data Science' },
      { id: 'statemachine', displayName: 'State Machine', description: 'State transition models and choice rules', category: 'UML' },
    ];

    initialCaps.forEach(cap => this.capabilityRegistry.register(cap));
  }

  private bootstrapTools(): void {
    const tools: ToolDefinition[] = [
      // Software Architecture Category
      {
        id: 'architecture-diagram',
        name: 'Architecture Diagram',
        description: 'Software topology and system connectivity blueprint mapping.',
        category: 'Software Architecture',
        version: '1.0.0',
        enabled: true,
        parserId: 'architecture-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['architecture'],
        supportedFileExtensions: ['txt', 'arch', 'sys'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['->', '=>'],
        tags: ['architecture', 'system', 'plain_text', 'docker_compose', 'terraform', 'yaml', 'json'],
        aliases: ['architecture', 'system'],
        priority: 1
      },
      // Database Engineering Category
      {
        id: 'er-diagram',
        name: 'ER Diagram',
        description: 'Entity Relationship databases table relations.',
        category: 'Database Engineering',
        version: '1.0.0',
        enabled: true,
        parserId: 'sql-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['erd', 'database'],
        supportedFileExtensions: ['prisma', 'dbml'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['table', 'ref:'],
        tags: ['er', 'erd', 'prisma', 'dbml'],
        aliases: ['er', 'erd', 'prisma'],
        priority: 2
      },
      {
        id: 'sql-schema',
        name: 'SQL Schema',
        description: 'Convert SQL tables definitions into interactive structural node maps.',
        category: 'Database Engineering',
        version: '1.0.0',
        enabled: true,
        parserId: 'sql-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['database'],
        supportedFileExtensions: ['sql', 'ddl'],
        supportedMimeTypes: ['application/sql', 'text/x-sql'],
        supportedContentPatterns: ['create table', 'primary key'],
        tags: ['sql', 'database'],
        aliases: ['sql', 'database'],
        priority: 2
      },
      // UML Category
      {
        id: 'class-diagram',
        name: 'Class Diagram',
        description: 'UML class properties and associations mapping.',
        category: 'UML',
        version: '1.0.0',
        enabled: false,
        parserId: 'class-parser',
        layoutId: 'hierarchical',
        rendererId: 'react-flow',
        capabilities: ['class'],
        supportedFileExtensions: ['class'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['class '],
        tags: ['class', 'uml'],
        aliases: ['class'],
        priority: 1
      },
      {
        id: 'sequence-diagram',
        name: 'Sequence Diagram',
        description: 'Sequence timelines detailing step by step process routes.',
        category: 'UML',
        version: '1.0.0',
        enabled: false,
        parserId: 'sequence-parser',
        layoutId: 'tree',
        rendererId: 'react-flow',
        capabilities: ['sequence'],
        supportedFileExtensions: ['seq'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['->', ':'],
        tags: ['sequence', 'uml'],
        aliases: ['sequence'],
        priority: 1
      },
      {
        id: 'activity-diagram',
        name: 'Activity Diagram',
        description: 'Action execution pathways mapping flow activity decisions.',
        category: 'UML',
        version: '1.0.0',
        enabled: false,
        parserId: 'activity-parser',
        layoutId: 'dag',
        rendererId: 'react-flow',
        capabilities: ['activity'],
        supportedFileExtensions: ['act'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['[*]'],
        tags: ['activity', 'uml'],
        aliases: ['activity'],
        priority: 1
      },
      {
        id: 'use-case-diagram',
        name: 'Use Case Diagram',
        description: 'UML use case diagrams mapping user actor scope thresholds.',
        category: 'UML',
        version: '1.0.0',
        enabled: false,
        parserId: 'use-case-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['usecase'],
        supportedFileExtensions: ['uc'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['actor', 'usecase'],
        tags: ['use-case', 'uml'],
        aliases: ['usecase'],
        priority: 1
      },
      {
        id: 'component-diagram',
        name: 'Component Diagram',
        description: 'UML components mapping modular libraries configurations.',
        category: 'UML',
        version: '1.0.0',
        enabled: false,
        parserId: 'component-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['component'],
        supportedFileExtensions: ['comp'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['[component]'],
        tags: ['component', 'uml'],
        aliases: ['component'],
        priority: 1
      },
      {
        id: 'deployment-diagram',
        name: 'Deployment Diagram',
        description: 'Physical topologies mapping hosts nodes and execution packages.',
        category: 'UML',
        version: '1.0.0',
        enabled: false,
        parserId: 'deployment-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['deployment'],
        supportedFileExtensions: ['dep'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['node ', 'artifact'],
        tags: ['deployment', 'uml'],
        aliases: ['deployment'],
        priority: 1
      },
      // Flow & Process Category
      {
        id: 'flowchart',
        name: 'Flowchart',
        description: 'Workflows detailing logical execution branches.',
        category: 'Flow & Process',
        version: '1.0.0',
        enabled: true,
        parserId: 'flow-parser',
        layoutId: 'dag',
        rendererId: 'react-flow',
        capabilities: ['flowchart'],
        supportedFileExtensions: ['flow'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['{decision}'],
        tags: ['flow', 'flowchart'],
        aliases: ['flowchart'],
        priority: 1
      },
      {
        id: 'bpmn',
        name: 'BPMN',
        description: 'Standard business process modeling notations maps.',
        category: 'Flow & Process',
        version: '1.0.0',
        enabled: false,
        parserId: 'bpmn-parser',
        layoutId: 'dag',
        rendererId: 'react-flow',
        capabilities: ['flowchart'],
        supportedFileExtensions: ['bpmn'],
        supportedMimeTypes: ['application/xml', 'text/xml'],
        supportedContentPatterns: ['bpmn:'],
        tags: ['bpmn'],
        aliases: ['bpmn'],
        priority: 1
      },
      // Cloud & DevOps Category
      {
        id: 'infrastructure-diagram',
        name: 'Infrastructure Diagram',
        description: 'Cloud resources topologies showing infrastructure scopes.',
        category: 'Cloud & DevOps',
        version: '1.0.0',
        enabled: false,
        parserId: 'cloud-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['deployment'],
        supportedFileExtensions: ['infra', 'tf'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['resource ', 'provider '],
        tags: ['infrastructure', 'cloud', 'terraform'],
        aliases: ['infrastructure', 'cloud'],
        priority: 1
      },
      {
        id: 'kubernetes-diagram',
        name: 'Kubernetes Diagram',
        description: 'K8s pods services and config configs mapping.',
        category: 'Cloud & DevOps',
        version: '1.0.0',
        enabled: false,
        parserId: 'k8s-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['deployment'],
        supportedFileExtensions: ['k8s', 'yaml'],
        supportedMimeTypes: ['text/yaml'],
        supportedContentPatterns: ['kind: Pod', 'kind: Service'],
        tags: ['k8s', 'kubernetes'],
        aliases: ['k8s', 'kubernetes'],
        priority: 1
      },
      {
        id: 'docker-diagram',
        name: 'Docker Diagram',
        description: 'Containerized packages and execution networks maps.',
        category: 'Cloud & DevOps',
        version: '1.0.0',
        enabled: false,
        parserId: 'docker-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['deployment'],
        supportedFileExtensions: ['yaml', 'yml'],
        supportedMimeTypes: ['text/yaml'],
        supportedContentPatterns: ['services:', 'image:'],
        tags: ['docker', 'docker_compose'],
        aliases: ['docker'],
        priority: 1
      },
      // API & Backend Category
      {
        id: 'openapi-diagram',
        name: 'OpenAPI Diagram',
        description: 'Endpoint routes payloads and response schemas mapping.',
        category: 'API & Backend',
        version: '1.0.0',
        enabled: false,
        parserId: 'openapi-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['api'],
        supportedFileExtensions: ['yaml', 'json'],
        supportedMimeTypes: ['application/json', 'text/yaml'],
        supportedContentPatterns: ['openapi:', 'swagger:'],
        tags: ['openapi', 'swagger'],
        aliases: ['openapi'],
        priority: 1
      },
      {
        id: 'api-flow',
        name: 'API Flow',
        description: 'Request execution routes detailing backend call flows.',
        category: 'API & Backend',
        version: '1.0.0',
        enabled: false,
        parserId: 'api-flow-parser',
        layoutId: 'dag',
        rendererId: 'react-flow',
        capabilities: ['api', 'flowchart'],
        supportedFileExtensions: ['apiflow'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['get ', 'post '],
        tags: ['api'],
        aliases: ['api-flow'],
        priority: 1
      },
      // Project Documentation Category
      {
        id: 'readme-architecture',
        name: 'README Architecture',
        description: 'Map markdown documentation trees into visual structures.',
        category: 'Project Documentation',
        version: '1.0.0',
        enabled: true,
        parserId: 'markdown-parser',
        layoutId: 'tree',
        rendererId: 'react-flow',
        capabilities: ['documentation', 'architecture'],
        supportedFileExtensions: ['md', 'markdown'],
        supportedMimeTypes: ['text/markdown'],
        supportedContentPatterns: ['# ', '## '],
        tags: ['readme', 'markdown'],
        aliases: ['readme'],
        priority: 2
      },
      {
        id: 'markdown-flow',
        name: 'Markdown Flow',
        description: 'Workflows parsed directly from bullet points indent patterns.',
        category: 'Project Documentation',
        version: '1.0.0',
        enabled: true,
        parserId: 'markdown-parser',
        layoutId: 'tree',
        rendererId: 'react-flow',
        capabilities: ['documentation', 'flowchart'],
        supportedFileExtensions: ['md', 'markdown'],
        supportedMimeTypes: ['text/markdown'],
        supportedContentPatterns: ['- ', '* '],
        tags: ['markdown', 'md'],
        aliases: ['markdown-flow'],
        priority: 1
      },
      // AI / ML Category
      {
        id: 'ml-pipeline',
        name: 'ML Pipeline',
        description: 'Data sets pipeline routes and training evaluations mapping.',
        category: 'AI / ML',
        version: '1.0.0',
        enabled: false,
        parserId: 'ml-pipeline-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['aiml'],
        supportedFileExtensions: ['mlp'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['train ', 'evaluate '],
        tags: ['ml', 'machine-learning'],
        aliases: ['ml-pipeline'],
        priority: 1
      },
      {
        id: 'neural-network',
        name: 'Neural Network',
        description: 'Neural networks weight layers structure maps.',
        category: 'AI / ML',
        version: '1.0.0',
        enabled: false,
        parserId: 'neural-network-parser',
        layoutId: 'grid',
        rendererId: 'react-flow',
        capabilities: ['aiml'],
        supportedFileExtensions: ['nn'],
        supportedMimeTypes: ['text/plain'],
        supportedContentPatterns: ['layer ', 'neurons '],
        tags: ['neural', 'network'],
        aliases: ['neural-network'],
        priority: 1
      }
    ];

    tools.forEach(tool => this.register(tool));
  }
}
