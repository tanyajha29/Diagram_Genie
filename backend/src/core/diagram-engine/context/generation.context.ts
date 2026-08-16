import { Diagram } from '../interfaces/diagram.interface';
import { DiagramGenerationResponse } from '../contracts/response.contracts';

/**
 * Diagnostics recorded by each pipeline stage during execution.
 */
export interface StageDiagnostic {
  stageId: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  durationMs?: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Request parameter envelope.
 */
export interface GenerationRequest {
  source: string;
  sourceType?: string;
  filename?: string;
  mimeType?: string;
  options?: Record<string, any>;
}

/**
 * GenerationContext is the single source of truth passed through the diagram generation pipeline,
 * accumulating state, warnings, errors, and stage diagnostics.
 */
export interface GenerationContext {
  /** Unique Request ID tracing the generation lifecycle */
  requestId: string;
  
  /** UTC timestamp of request arrival */
  timestamp: string;

  /** The incoming request parameters */
  request: GenerationRequest;

  /** The final response envelope mapping output and diagnostics */
  response?: DiagramGenerationResponse;

  /** Resolved catalog tool ID mapping to this request */
  selectedTool?: string;
  
  /** Auto-detected file type category */
  detectedFileType?: string;
  
  /** Raw UDM nodes/edges structure parsed from source before layout positioning */
  parserOutput?: Diagram;
  
  /** Consolidated positioned framework-independent Universal Diagram Model */
  diagram?: Diagram;
  
  /** Final coordinates-mapped renderer graph representation (e.g. React Flow nodes/edges) */
  rendererOutput?: any;
  
  /** Collection of non-blocking warning strings accumulated throughout the run */
  warnings: string[];
  
  /** Collection of critical execution block error strings */
  errors: string[];
  
  /** Custom dictionary for extension metadata (e.g., loaded tool definition, runtime options) */
  metadata: Record<string, any>;
  
  /** Traced performance and diagnostics logs for each pipeline stage */
  stageExecution: Record<string, StageDiagnostic>;
}
