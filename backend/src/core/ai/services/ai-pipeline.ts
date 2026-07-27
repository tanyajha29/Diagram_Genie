import { Injectable, Logger } from '@nestjs/common';
import { AIManager } from './ai-manager';
import { Diagram, DiagramNode, DiagramEdge } from '../../diagram-engine/diagram-engine.module';

@Injectable()
export class AiPipeline {
  private readonly logger = new Logger(AiPipeline.name);

  constructor(private readonly aiManager: AIManager) {}

  async run(
    category: string,
    version: string,
    placeholders: Record<string, string>,
    parserOutput?: Diagram, // Optional deterministic parser output to merge
    options?: { provider?: string; timeout?: number; abortSignal?: AbortSignal }
  ): Promise<Diagram> {
    this.logger.log(`Running AI Pipeline for category: ${category}`);

    // 1-5. Execute AI Request (Prompt Building -> Provider Selection -> AI Request -> JSON Extraction -> Schema Validation)
    const response = await this.aiManager.executeExtraction(category, version, placeholders, options);
    
    // Parse validated JSON object
    const extractedData = JSON.parse(response.text);

    // 6. Normalization: Map diverse schema formats to standard UDM nodes/edges
    const normalizedNodes: DiagramNode[] = [];
    const normalizedEdges: DiagramEdge[] = [];
    
    this.normalize(category, extractedData, normalizedNodes, normalizedEdges);

    // 7. Merge with Parser Output (if provided)
    let finalNodes = normalizedNodes;
    let finalEdges = normalizedEdges;
    
    if (parserOutput) {
      this.logger.log(`Merging AI Pipeline output with local parser output (${parserOutput.nodes.length} nodes)...`);
      const merged = this.mergeGraphs(parserOutput.nodes, parserOutput.edges, normalizedNodes, normalizedEdges);
      finalNodes = merged.nodes;
      finalEdges = merged.edges;
    }

    // 8. Construct Universal Diagram Model (UDM)
    return {
      id: `ai_pipeline_${Date.now()}`,
      title: `${category.toUpperCase()} System Diagram`,
      nodes: finalNodes,
      edges: finalEdges,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        engineVersion: '2.0',
        sourceType: `ai-${category}`
      }
    };
  }

  private normalize(
    category: string,
    data: any,
    nodes: DiagramNode[],
    edges: DiagramEdge[]
  ): void {
    const cat = category.toLowerCase();

    if (cat === 'database' || cat === 'er') {
      // ER Extraction normalization
      const tables = data.tables || [];
      tables.forEach((table: any) => {
        nodes.push({
          id: table.name.toLowerCase(),
          type: 'database-table',
          label: table.name,
          position: { x: 0, y: 0 },
          data: { columns: table.columns || [] },
          style: { backgroundColor: '#0f172a', borderColor: '#f59e0b', textColor: '#f59e0b', borderWidth: 2 }
        });
      });

      const relationships = data.relationships || [];
      relationships.forEach((rel: any, idx: number) => {
        edges.push({
          id: `rel_${rel.fromTable}_${rel.toTable}_${idx}`,
          source: rel.fromTable.toLowerCase(),
          target: rel.toTable.toLowerCase(),
          label: `${rel.fromCol} -> ${rel.toCol}`,
          animated: false
        });
      });

    } else if (cat === 'uml') {
      // UML Extraction normalization
      const classes = data.classes || [];
      classes.forEach((cls: any) => {
        nodes.push({
          id: cls.name.toLowerCase(),
          type: 'uml-class',
          label: cls.name,
          position: { x: 0, y: 0 },
          data: { attributes: cls.attributes || [], methods: cls.methods || [] },
          style: { backgroundColor: '#0f172a', borderColor: '#8b5cf6', textColor: '#8b5cf6', borderWidth: 2 }
        });
      });

      const associations = data.associations || [];
      associations.forEach((assoc: any, idx: number) => {
        edges.push({
          id: `assoc_${assoc.source}_${assoc.target}_${idx}`,
          source: assoc.source.toLowerCase(),
          target: assoc.target.toLowerCase(),
          label: assoc.type,
          animated: false
        });
      });

    } else if (cat === 'cloud') {
      // Cloud resources normalization
      const resources = data.resources || [];
      resources.forEach((res: any) => {
        nodes.push({
          id: res.id.toLowerCase(),
          type: 'cloud-node',
          label: res.name,
          position: { x: 0, y: 0 },
          data: { resourceType: res.type, provider: res.provider },
          style: { backgroundColor: '#0f172a', borderColor: '#0ea5e9', textColor: '#0ea5e9', borderWidth: 2 }
        });
      });

      const connections = data.connections || [];
      connections.forEach((conn: any, idx: number) => {
        edges.push({
          id: `conn_${conn.source}_${conn.target}_${idx}`,
          source: conn.source.toLowerCase(),
          target: conn.target.toLowerCase(),
          label: conn.protocol,
          animated: true
        });
      });

    } else if (cat === 'api') {
      // API Route normalization
      const endpoints = data.endpoints || [];
      endpoints.forEach((ep: any) => {
        const nodeId = `${ep.method.toLowerCase()}_${ep.path.replace(/[\/:]/g, '_')}`;
        nodes.push({
          id: nodeId,
          type: 'api-endpoint',
          label: `${ep.method} ${ep.path}`,
          position: { x: 0, y: 0 },
          data: { summary: ep.summary, responses: ep.responses || [] },
          style: { backgroundColor: '#0f172a', borderColor: '#10b981', textColor: '#10b981', borderWidth: 2 }
        });
      });

      const dependencies = data.dependencies || [];
      dependencies.forEach((dep: any, idx: number) => {
        edges.push({
          id: `api_dep_${idx}`,
          source: dep.endpointPath.toLowerCase().replace(/[\/:]/g, '_'),
          target: dep.callsService.toLowerCase(),
          label: 'calls',
          animated: true
        });
      });

    } else {
      // Default: Architecture/Flow node normalization
      const rawNodes = data.nodes || [];
      rawNodes.forEach((node: any) => {
        nodes.push({
          id: node.id.toLowerCase(),
          type: node.type,
          label: node.label,
          position: { x: 0, y: 0 },
          style: this.getNodeStyleForType(node.type)
        });
      });

      const rawEdges = data.edges || [];
      rawEdges.forEach((edge: any, idx: number) => {
        edges.push({
          id: `edge_${edge.source}_${edge.target}_${idx}`,
          source: edge.source.toLowerCase(),
          target: edge.target.toLowerCase(),
          label: edge.label,
          animated: true
        });
      });
    }
  }

  private mergeGraphs(
    nodesA: DiagramNode[],
    edgesA: DiagramEdge[],
    nodesB: DiagramNode[],
    edgesB: DiagramEdge[]
  ): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
    const mergedNodes = new Map<string, DiagramNode>();

    // Add all nodes from A (parser output)
    nodesA.forEach(n => mergedNodes.set(n.id, { ...n }));

    // Add nodes from B (AI output), merging properties if duplicates exist
    nodesB.forEach((nodeB) => {
      const existing = mergedNodes.get(nodeB.id);
      if (existing) {
        mergedNodes.set(nodeB.id, {
          ...existing,
          label: nodeB.label || existing.label,
          type: nodeB.type || existing.type,
          data: { ...existing.data, ...nodeB.data },
          style: { ...existing.style, ...nodeB.style }
        });
      } else {
        mergedNodes.set(nodeB.id, { ...nodeB });
      }
    });

    const mergedEdges = new Map<string, DiagramEdge>();

    // Add edges from A
    edgesA.forEach(e => mergedEdges.set(`${e.source}->${e.target}`, { ...e }));

    // Add edges from B, avoiding duplicate source-target mappings
    edgesB.forEach((edgeB) => {
      const key = `${edgeB.source}->${edgeB.target}`;
      if (!mergedEdges.has(key)) {
        mergedEdges.set(key, { ...edgeB });
      }
    });

    return {
      nodes: Array.from(mergedNodes.values()),
      edges: Array.from(mergedEdges.values())
    };
  }

  private getNodeStyleForType(type: string) {
    const styles: Record<string, any> = {
      terminal: { backgroundColor: '#0f172a', borderColor: '#10b981', textColor: '#10b981', borderRadius: 20, borderWidth: 2 },
      decision: { backgroundColor: '#0f172a', borderColor: '#f59e0b', textColor: '#f59e0b', borderWidth: 2 },
      process: { backgroundColor: '#0f172a', borderColor: '#3b82f6', textColor: '#f8fafc', borderWidth: 2 },
      frontend: { backgroundColor: '#0f172a', borderColor: '#3b82f6', textColor: '#3b82f6', borderWidth: 2 },
      backend: { backgroundColor: '#0f172a', borderColor: '#10b981', textColor: '#10b981', borderWidth: 2 },
      database: { backgroundColor: '#0f172a', borderColor: '#f59e0b', textColor: '#f59e0b', borderWidth: 2 },
      queue: { backgroundColor: '#0f172a', borderColor: '#8b5cf6', textColor: '#8b5cf6', borderWidth: 2 },
      external: { backgroundColor: '#0f172a', borderColor: '#ec4899', textColor: '#ec4899', borderWidth: 2 }
    };
    return styles[type] || { backgroundColor: '#0f172a', borderColor: '#94a3b8', textColor: '#f8fafc', borderWidth: 1 };
  }
}
