import { Injectable } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';
import { ParserRegistry } from '../registry/parser.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../interfaces';
import { ParserResult } from './parser-result.interface';

@Injectable()
export class TerraformParser implements IParser {
  readonly id = 'terraform-parser';

  constructor(private readonly registry: ParserRegistry) {
    this.registry.register(this);
  }

  supports(sourceType: string): boolean {
    const type = sourceType.toLowerCase();
    return type === 'terraform' || type === 'tf';
  }

  validate(source: string): boolean {
    return source.trim().length > 0 && (source.includes('resource ') || source.includes('provider '));
  }

  async parse(source: string, options?: Record<string, any>): Promise<ParserResult> {
    const nodes: DiagramNode[] = [];
    const edges: DiagramEdge[] = [];
    
    interface TfResource {
      id: string;
      type: string;
      name: string;
      lines: string[];
    }

    const resources: TfResource[] = [];
    const lines = source.split(/\r?\n/).map(l => l.trim());
    
    let currentRes: TfResource | null = null;
    let braceCount = 0;

    lines.forEach((line) => {
      if (line.length === 0) return;

      const resMatch = line.match(/^resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/);
      if (resMatch) {
        const type = resMatch[1];
        const name = resMatch[2];
        currentRes = {
          id: `${type}.${name}`,
          type,
          name,
          lines: []
        };
        braceCount = 1;
        resources.push(currentRes);
        return;
      }

      const modMatch = line.match(/^module\s+"([^"]+)"\s*\{/);
      if (modMatch) {
        const name = modMatch[1];
        currentRes = {
          id: `module.${name}`,
          type: 'module',
          name,
          lines: []
        };
        braceCount = 1;
        resources.push(currentRes);
        return;
      }

      if (currentRes) {
        if (line.includes('{')) braceCount++;
        if (line.includes('}')) braceCount--;

        if (braceCount === 0) {
          currentRes = null;
        } else {
          currentRes.lines.push(line);
        }
      }
    });

    // Create Nodes and trace dependencies
    resources.forEach((res) => {
      const provider = res.type.split('_')[0] || 'aws';
      
      // Determine containment parent if any
      let parentId: string | undefined = undefined;

      // Scan for resource references inside property declarations (e.g. vpc_id = aws_vpc.main.id)
      const dependencies: string[] = [];
      res.lines.forEach((pLine) => {
        // Find things matching: aws_vpc.main or similar resource ids
        resources.forEach((otherRes) => {
          if (otherRes.id !== res.id && pLine.includes(otherRes.id)) {
            dependencies.push(otherRes.id);
            
            // Containment heuristic: Subnets belong inside VPCs
            if (res.type.includes('subnet') && otherRes.type === 'aws_vpc') {
              parentId = otherRes.id.replace(/\./g, '_');
            }
          }
        });
      });

      const cleanId = res.id.replace(/\./g, '_');

      nodes.push({
        id: cleanId,
        label: `${res.type}\n"${res.name}"`,
        type: 'cloud-node',
        parentId: parentId ? parentId : undefined,
        position: { x: 0, y: 0 },
        data: {
          resourceType: res.type,
          provider,
          name: res.name,
          description: `Terraform ${res.type}`
        }
      });

      dependencies.forEach((depId) => {
        const depCleanId = depId.replace(/\./g, '_');
        edges.push({
          id: `e-tf-${cleanId}-${depCleanId}`,
          source: cleanId,
          target: depCleanId,
          animated: true
        });
      });
    });

    // Post-process containment coordinates and setup containers
    // If a node is a VPC, map its type to 'container' so layouter renders it as a frame
    nodes.forEach((node) => {
      if (node.data?.resourceType === 'aws_vpc' || node.data?.resourceType === 'aws_security_group') {
        node.type = 'container';
      }
    });

    if (nodes.length === 0) {
      nodes.push({
        id: 'empty_tf',
        label: 'Empty Terraform Workspace',
        type: 'cloud-node',
        position: { x: 0, y: 0 },
        data: {}
      });
    }

    const diagram = {
      id: `terraform_${Date.now()}`,
      title: 'Terraform Infrastructure Map',
      nodes,
      edges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: 'terraform'
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
