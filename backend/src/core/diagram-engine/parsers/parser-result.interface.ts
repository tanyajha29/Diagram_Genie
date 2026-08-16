import { Diagram } from '../interfaces/diagram.interface';

/**
 * Diagnostic and data statistics payload returned by deterministic parsers.
 */
export interface ParserResult {
  /** The generated framework-independent Universal Diagram Model */
  diagram: Diagram;
  
  /** Recoverable syntax issues found during execution */
  warnings: string[];
  
  /** Parser telemetry metrics */
  statistics: {
    linesParsed: number;
    nodesCreated: number;
    edgesCreated: number;
    ignoredLines: number;
    parseDurationMs: number;
  };
}
