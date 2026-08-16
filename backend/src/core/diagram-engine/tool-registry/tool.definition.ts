/**
 * Configuration and metadata definition for a diagram generation tool.
 * Serves as the central configuration source driving the generation pipeline.
 */
export interface ToolDefinition {
  /** Unique identifier of the tool (e.g. 'architecture-diagram', 'sql-schema') */
  id: string;
  
  /** Short descriptive display name */
  name: string;
  
  /** Explanation of what the tool accomplishes */
  description: string;
  
  /** Classification category (e.g. 'Software Architecture', 'UML') */
  category: string;
  
  /** Semantic version string */
  version: string;
  
  /** Active status of the tool; disabled tools are skipped in routing resolutions */
  enabled: boolean;

  // Pipeline Routing Targets
  /** The target parser service identifier to compile this syntax input */
  parserId: string;
  
  /** The target layout engine identifier to position nodes */
  layoutId: string;
  
  /** The target rendering adapter identifier to construct renderer models */
  rendererId: string;

  // Capability Mappings
  /** Capability IDs that this tool satisfies (e.g. ['ARCHITECTURE', 'DEPLOYMENT']) */
  capabilities: string[];

  // Input Support Filters
  /** File extensions matched by this tool (without leading dot, e.g. ['sql', 'ddl']) */
  supportedFileExtensions: string[];
  
  /** MIME types matched by this tool (e.g. ['application/sql']) */
  supportedMimeTypes: string[];
  
  /** Key syntax substrings or regex content patterns matched by this tool (e.g. ['create table']) */
  supportedContentPatterns: string[];

  // Metadata Resolution Tags
  /** Search and indexing keywords */
  tags: string[];
  
  /** Alternative alias keys used in sourceType resolution */
  aliases: string[];
  
  /** Match resolving priority weighting (higher number indicates higher precedence) */
  priority: number;

  // Pipeline Extension Hooks (Optional)
  /** Target AI prompt document template ID */
  aiPromptId?: string;
  
  /** Exporter formats supported by downstream compilation blocks */
  exporterIds?: string[];
  
  /** Schema validation plugin identifier */
  validatorId?: string;

  /** Extensible custom metadata payload */
  metadata?: Record<string, any>;
}
