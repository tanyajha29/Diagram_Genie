import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class DockerComposeParser implements IParser {
  readonly id = 'docker-compose-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'docker-compose' || type === 'compose';
  }

  validate(source: string): boolean {
    return source.trim().length > 0 && source.includes('services:');
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    
    interface ComposeService {
      name: string;
      image?: string;
      ports: string[];
      dependsOn: string[];
      environment: string[];
    }

    const services = new Map<string, ComposeService>();
    const lines = source.split(/\r?\n/);
    
    let inServices = false;
    let currentService: ComposeService | null = null;
    let inDependsOn = false;
    let inPorts = false;
    let inEnv = false;
    let serviceIndent = 0;

    const getIndent = (str: string): number => {
      const match = str.match(/^(\s*)/);
      return match ? match[1].length : 0;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) return;

      const indent = getIndent(line);

      // Root services block check
      if (trimmed === 'services:') {
        inServices = true;
        currentService = null;
        return;
      }

      if (inServices) {
        // If indent returns back to root, exit services block
        if (indent === 0 && trimmed.includes(':')) {
          inServices = false;
          currentService = null;
          return;
        }

        // New service declaration
        // e.g. "  web:" (indent 2)
        if (trimmed.endsWith(':') && !trimmed.startsWith('-')) {
          const sName = trimmed.slice(0, -1).trim();
          
          // Detect service nesting base indent (typically 2 or 4 spaces)
          if (!currentService || indent <= serviceIndent) {
            serviceIndent = indent;
            currentService = {
              name: sName,
              ports: [],
              dependsOn: [],
              environment: []
            };
            services.set(sName, currentService);
            inDependsOn = false;
            inPorts = false;
            inEnv = false;
            return;
          }
        }

        if (currentService) {
          // Detect block sections
          if (trimmed === 'depends_on:') {
            inDependsOn = true;
            inPorts = false;
            inEnv = false;
            return;
          }
          if (trimmed === 'ports:') {
            inPorts = true;
            inDependsOn = false;
            inEnv = false;
            return;
          }
          if (trimmed === 'environment:') {
            inEnv = true;
            inDependsOn = false;
            inPorts = false;
            return;
          }

          // If it is another field name at the service block level
          if (trimmed.includes(':') && !trimmed.startsWith('-')) {
            inDependsOn = false;
            inPorts = false;
            inEnv = false;

            if (trimmed.startsWith('image:')) {
              currentService.image = trimmed.replace('image:', '').trim().replace(/['"]/g, '');
            }
            return;
          }

          // Handle bullet item values under blocks
          if (trimmed.startsWith('-')) {
            const val = trimmed.slice(1).trim().replace(/['"]/g, '');
            if (inDependsOn) {
              currentService.dependsOn.push(val);
            } else if (inPorts) {
              currentService.ports.push(val);
            } else if (inEnv) {
              currentService.environment.push(val);
            }
          }
        }
      }
    });

    // Build Nodes and Edges
    services.forEach((service, name) => {
      const cleanId = name.toLowerCase().replace(/\s+/g, '_');
      
      nodes.push({
        id: cleanId,
        label: service.name,
        type: 'cloud-node',
        position: { x: 0, y: 0 },
        data: {
          image: service.image || 'latest',
          ports: service.ports,
          environmentCount: service.environment.length,
          description: `Container: ${service.image || name}`
        }
      });

      service.dependsOn.forEach((dep) => {
        const depCleanId = dep.toLowerCase().replace(/\s+/g, '_');
        edges.push({
          id: `e-compose-${cleanId}-${depCleanId}`,
          source: cleanId,
          target: depCleanId,
          animated: true
        });
      });
    });

    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_compose',
        label: 'Empty Compose Stack',
        type: 'cloud-node',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `compose_${Date.now()}`,
      title: 'Docker Compose Map',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'docker-compose'
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
