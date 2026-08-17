export interface GenerateDiagramParams {
  source: string;
  sourceType?: string;
  filename?: string;
  mimeType?: string;
  layoutEngineId?: string;
  options?: Record<string, any>;
}

export interface Warning {
  code: string;
  message: string;
}

export interface DiagramGenerationResponse {
  success: boolean;
  diagram: any;
  reactFlow: {
    nodes: any[];
    edges: any[];
  };
  warnings?: Warning[];
  errors?: string[];
  diagnostics?: {
    parserType: string;
    layoutEngineId: string;
    fileTypeDetected?: string;
    validationSuccess: boolean;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    executionDurationMs: number;
    stages: Record<string, number>;
  };
}

export class DiagramService {
  private static readonly BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  /**
   * Pings the health endpoint to verify backend status.
   */
  static async health(): Promise<{ status: string }> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout

    try {
      const response = await fetch(`${this.BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(id);
      if (!response.ok) {
        throw new Error('Health check response not OK');
      }
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  /**
   * Calls the backend API to generate UDM and React Flow graphs from code sources.
   */
  static async generateDiagram(params: GenerateDiagramParams): Promise<DiagramGenerationResponse> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    try {
      const response = await fetch(`${this.BASE_URL}/diagrams/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `API error (${response.status})`);
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check backend connection.');
      }
      throw err;
    }
  }
}
