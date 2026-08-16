import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class OpenApiParser implements IParser {
  readonly id = 'openapi-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'openapi' || type === 'swagger';
  }

  validate(source: string): boolean {
    const s = source.trim();
    return s.length > 0 && (s.includes('openapi:') || s.includes('swagger:') || s.includes('"openapi"') || s.includes('"swagger"'));
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];

    interface Endpoint {
      path: string;
      method: string;
      summary?: string;
    }

    const endpoints: Endpoint[] = [];

    const cleanSource = source.trim();

    // Check if JSON format
    if (cleanSource.startsWith('{')) {
      try {
        const obj = JSON.parse(cleanSource);
        if (obj && obj.paths) {
          Object.keys(obj.paths).forEach((path) => {
            const pathObj = obj.paths[path];
            if (pathObj) {
              Object.keys(pathObj).forEach((method) => {
                const m = method.toLowerCase();
                if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(m)) {
                  endpoints.push({
                    path,
                    method: m.toUpperCase(),
                    summary: pathObj[method]?.summary || pathObj[method]?.description
                  });
                }
              });
            }
          });
        }
      } catch (err) {
        // Fallback to text matching if JSON parse fails
      }
    } else {
      // Parse YAML line by line
      const lines = source.split(/\r?\n/);
      let currentPath: string | null = null;
      let pathIndent = 0;

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.length === 0 || trimmed.startsWith('#')) return;

        const indent = line.search(/\S/);

        // Path detection (e.g. "/users:" or "  /users/id:")
        const pathMatch = trimmed.match(/^"\/([^"]+)"\s*:/) || trimmed.match(/^\/([a-zA-Z0-9_\-\{\}/]+)\s*:/);
        if (pathMatch) {
          currentPath = trimmed.slice(0, trimmed.indexOf(':')).replace(/"/g, '').trim();
          pathIndent = indent;
          return;
        }

        // Method detection under path
        if (currentPath && indent > pathIndent) {
          const methodMatch = trimmed.match(/^(get|post|put|delete|patch|options|head)\s*:/i);
          if (methodMatch) {
            endpoints.push({
              path: currentPath,
              method: methodMatch[1].toUpperCase()
            });
          }
        }
      });
    }

    // Centered gateway root node
    nodes.push({
      id: 'api_gateway',
      label: 'API Gateway Ingress',
      type: 'service',
      position: { x: 0, y: 0 },
      data: { description: 'OpenAPI Entrypoint Gateway' }
    });

    // Populate routes
    endpoints.forEach((ep, idx) => {
      const cleanId = `ep_${ep.method.toLowerCase()}_${ep.path.replace(/[\/\{\}\-]/g, '_')}`;

      nodes.push({
        id: cleanId,
        label: `${ep.method} ${ep.path}`,
        type: 'api-endpoint',
        position: { x: 0, y: 0 },
        data: {
          path: ep.path,
          method: ep.method,
          description: ep.summary || `${ep.method} operations endpoint`
        }
      });

      edges.push({
        id: `e-api-gateway-${cleanId}`,
        source: 'api_gateway',
        target: cleanId,
        animated: true
      });
    });

    if (nodes.length === 1) { // Only gateway exists
      nodes.push({
        id: 'empty_endpoint',
        label: 'No endpoints declared',
        type: 'api-endpoint',
        position: { x: 0, y: 0 },
        data: {}
      });
      edges.push({
        id: 'e-empty',
        source: 'api_gateway',
        target: 'empty_endpoint'
      });
    }

    const diagram = {
      id: `openapi_${Date.now()}`,
      title: 'OpenAPI Routing Graph',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'openapi'
      }
    };

    return {
      diagram,
      warnings: [],
      statistics: {
        linesParsed: source.split('\n').length,
        nodesCreated: nodes.length,
        edgesCreated: edges.length,
        ignoredLines: 0,
        parseDurationMs: 0
      }
    };
  }
}
