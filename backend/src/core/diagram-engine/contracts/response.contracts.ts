import { Diagram } from '../interfaces/diagram.interface';
import { ReactFlowGraph } from '../../../modules/diagram/adapters/react-flow.adapter';

/**
 * Standard warning structure for non-blocking execution updates.
 */
export interface Warning {
  /** Warning code key */
  code: string;
  
  /** Short message detailing the issue */
  message: string;
  
  /** Additional diagnostic contextual details */
  details?: string;
}

/**
 * DiagnosticInfo details engine state decisions for tracking and support.
 */
export interface DiagnosticInfo {
  /** The identified input parser handler name */
  parserType: string;
  
  /** The layout engine identifier selected */
  layoutEngineId: string;
  
  /** The detected file type category (if processed) */
  fileTypeDetected?: string;
  
  /** Validation success check state */
  validationSuccess?: boolean;
}

/**
 * ExecutionMetadata tracks execution duration and stages processing time.
 */
export interface ExecutionMetadata {
  /** Unique Request ID tracing the generation lifecycle */
  requestId: string;
  
  /** UTC timestamp format */
  timestamp: string;
  
  /** Total elapsed time in milliseconds */
  executionDurationMs: number;
  
  /** Breakdown of stage durations (e.g., parsing, layout) */
  stages: Record<string, number>;
}

/**
 * DiagramGenerationResponse is returned by diagrams generate endpoints.
 */
export interface DiagramGenerationResponse {
  /** Indicates if the full request completed successfully */
  success: boolean;
  
  /** The resolved Universal Diagram Model (UDM) */
  diagram?: Diagram;
  
  /** Structured nodes and edges in React Flow compatible schema format */
  reactFlow?: ReactFlowGraph;
  
  /** Optional array of non-blocking execution warnings */
  warnings?: Warning[];
  
  /** Optional array of errors */
  errors?: string[];
  
  /** Telemetry runtime parameters and diagnostic indicators */
  diagnostics?: DiagnosticInfo;
  
  /** Request duration and tracing metadata */
  metadata?: ExecutionMetadata;
}

/**
 * ErrorResponse is returned by global validation or filter catches.
 */
export interface ErrorResponse {
  /** Indicates success state (always false in error conditions) */
  success: boolean;
  
  /** Message explaining the root exception cause */
  message: string;
  
  /** Detailed array of exception checks (e.g. Zod validation items) */
  errors?: string[];
  
  /** Tracking properties mapping to the failed request logs */
  metadata?: {
    requestId: string;
    timestamp: string;
  };
}
