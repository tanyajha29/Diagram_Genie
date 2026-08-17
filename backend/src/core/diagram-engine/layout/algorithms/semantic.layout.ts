import { Injectable, Logger } from '@nestjs/common';
import { ILayout } from '../interfaces/layout.interface';
import { LayoutRegistry } from '../registry/layout.registry';
import { Diagram, DiagramNode, DiagramEdge } from '../../interfaces';

/**
 * Utility to wrap text to a maximum line length in characters.
 */
export function wrapTextBackend(text: string, maxCharsPerLine: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

@Injectable()
export class SemanticLayout implements ILayout {
  readonly id = 'semantic';
  private readonly logger = new Logger(SemanticLayout.name);

  constructor(private readonly registry: LayoutRegistry) {
    this.registry.register(this);
    // Also register under helper aliases to satisfy specific tool calls
    this.registry.register({ id: 'architecture', layout: this.layout.bind(this) });
    this.registry.register({ id: 'database', layout: this.layout.bind(this) });
    this.registry.register({ id: 'flow', layout: this.layout.bind(this) });
    this.registry.register({ id: 'uml', layout: this.layout.bind(this) });
    this.registry.register({ id: 'cloud', layout: this.layout.bind(this) });
    this.registry.register({ id: 'api', layout: this.layout.bind(this) });
    this.registry.register({ id: 'aiml', layout: this.layout.bind(this) });
  }

  async layout(diagram: Diagram, options?: Record<string, any>): Promise<Diagram> {
    let category = (options?.category || diagram.metadata?.sourceType || 'architecture').toLowerCase();

    // Filter out group boundary nodes to prevent duplicating container nodes
    const dataNodes = diagram.nodes.filter(n => n.type !== 'group' && n.type !== 'container');

    // Auto-detect category from UDM graph semantics if it is generic architecture
    if (category === 'architecture' || category === 'default') {
      const labels = dataNodes.map(n => n.label.toLowerCase() + ' ' + (n.type || '').toLowerCase());
      const types = dataNodes.map(n => (n.type || '').toLowerCase());

      if (types.includes('endpoint') || labels.some(l => l.includes('/api') || l.includes('http') || l.includes('controller') || l.includes('middleware') || l.includes('endpoint') || l.includes('route'))) {
        category = 'api';
      } else if (types.some(t => ['dataset', 'model', 'transform', 'evaluation', 'serving'].includes(t)) || labels.some(l => l.includes('dataset') || l.includes('pipeline') || l.includes('training') || l.includes('inference') || l.includes('cleaning') || l.includes('engineering') || l.includes('model evaluation'))) {
        category = 'aiml';
      } else if (types.some(t => ['cloud', 'container', 'group'].includes(t)) || labels.some(l => l.includes('vpc') || l.includes('subnet') || l.includes('ec2') || l.includes('s3') || l.includes('rds') || l.includes('aws') || l.includes('azure') || l.includes('gcp'))) {
        category = 'cloud';
      } else if (types.some(t => ['class', 'interface'].includes(t)) || labels.some(l => l.includes('class ') || l.includes('interface '))) {
        category = 'uml';
      }
    }

    this.logger.log(`Applying semantic layout strategy for category: ${category}`);

    // Configurable spacing constants (Task 7)
    const horizontalNodeGap = options?.horizontalNodeGap || 240;
    const verticalNodeGap = options?.verticalNodeGap || 160;
    const containerPadding = options?.containerPadding || 60;
    const layerGap = options?.layerGap || 160;

    let processedNodes: DiagramNode[] = [];
    const processedEdges: DiagramEdge[] = [...diagram.edges];

    if (category.includes('db') || category.includes('sql') || category.includes('er') || category.includes('database')) {
      processedNodes = await this.layoutDatabaseER(dataNodes, processedEdges, horizontalNodeGap + 40, verticalNodeGap);
    } else if (category.includes('flow')) {
      processedNodes = await this.layoutFlowchart(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap);
    } else if (category.includes('uml')) {
      processedNodes = await this.layoutUML(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap);
    } else if (category.includes('cloud')) {
      processedNodes = await this.layoutCloud(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap, containerPadding);
    } else if (category.includes('api')) {
      processedNodes = await this.layoutAPI(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap);
    } else if (category.includes('aiml') || category.includes('pipeline')) {
      processedNodes = await this.layoutAIML(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap);
    } else if (category.includes('sequence')) {
      processedNodes = await this.layoutSequence(dataNodes, processedEdges, horizontalNodeGap + 40, verticalNodeGap);
    } else if (category.includes('mindmap') || category.includes('documentation') || category.includes('project-doc') || category.includes('tree')) {
      processedNodes = await this.layoutMindmap(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap);
    } else {
      // Default / Architecture layout with semantic layering (Task 4)
      processedNodes = await this.layoutArchitecture(dataNodes, processedEdges, horizontalNodeGap, verticalNodeGap, layerGap, containerPadding);
    }

    // Task 6: Node Overlap Prevention (Sanity Check Pass)
    this.preventNodeOverlaps(processedNodes, horizontalNodeGap, verticalNodeGap);

    return {
      ...diagram,
      nodes: processedNodes,
      edges: processedEdges,
    };
  }

  /**
   * Layout Strategy for Layered Architecture with semantic containers.
   */
  private async layoutArchitecture(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    spacingX: number,
    spacingY: number,
    layerGap: number,
    padding: number
  ): Promise<DiagramNode[]> {
    // 1. Assign nodes to layers based on type and keywords
    const layers = {
      presentation: [] as DiagramNode[],
      application: [] as DiagramNode[],
      business: [] as DiagramNode[],
      data: [] as DiagramNode[],
      external: [] as DiagramNode[]
    };

    nodes.forEach(node => {
      const type = (node.type || '').toLowerCase();
      const label = node.label.toLowerCase();

      if (type === 'frontend' || label.includes('client') || label.includes('web') || label.includes('ui') || label.includes('mobile') || label.includes('frontend')) {
        layers.presentation.push(node);
      } else if (type === 'gateway' || label.includes('gateway') || label.includes('proxy') || label.includes('balancer')) {
        layers.application.push(node);
      } else if (type === 'database' || type === 'table' || label.includes('db') || label.includes('database') || label.includes('postgres') || label.includes('redis') || label.includes('sql') || label.includes('mongo')) {
        layers.data.push(node);
      } else if (type === 'external' || label.includes('external') || label.includes('stripe') || label.includes('sendgrid') || label.includes('mail') || label.includes('provider')) {
        layers.external.push(node);
      } else {
        layers.business.push(node);
      }
    });

    const finalNodes: DiagramNode[] = [];
    const absolutePositions = new Map<string, { x: number; y: number }>();

    // Layer Y coordinate assignments
    const layerY = {
      presentation: 100,
      application: 100 + layerGap,
      business: 100 + layerGap * 2,
      data: 100 + layerGap * 3,
      external: 100 + layerGap * 4
    };

    // Helper to estimate node dimensions
    const getNodeWidth = (n: DiagramNode) => n.width || (n.type === 'database' ? 256 : 208);
    const getNodeHeight = (n: DiagramNode) => n.height || (n.type === 'database' ? 140 : 76);

    // 2. Sort layer nodes horizontally using connections to reduce edge crossings (Task 6)
    const layerNames: Array<keyof typeof layers> = ['presentation', 'application', 'business', 'data', 'external'];
    
    layerNames.forEach((layerName, layerIdx) => {
      const layerNodes = layers[layerName];
      if (layerNodes.length === 0) return;

      // Barycenter heuristic: sort nodes by the average index of connected nodes in previous layers
      if (layerIdx > 0) {
        layerNodes.sort((a, b) => {
          const getAverageConnectedX = (node: DiagramNode) => {
            const connected = edges.filter(e => e.source === node.id || e.target === node.id);
            if (connected.length === 0) return 0;
            let sumX = 0;
            let count = 0;
            connected.forEach(e => {
              const neighborId = e.source === node.id ? e.target : e.source;
              const pos = absolutePositions.get(neighborId);
              if (pos) {
                sumX += pos.x;
                count++;
              }
            });
            return count > 0 ? sumX / count : 0;
          };
          return getAverageConnectedX(a) - getAverageConnectedX(b);
        });
      }

      // Compute horizontal alignments
      const totalWidth = layerNodes.reduce((acc, n, idx) => acc + getNodeWidth(n) + (idx < layerNodes.length - 1 ? spacingX - 100 : 0), 0);
      const startX = 200 - totalWidth / 2;

      let currentX = startX;
      layerNodes.forEach((node) => {
        const x = currentX;
        const y = layerY[layerName];
        absolutePositions.set(node.id, { x, y });
        currentX += getNodeWidth(node) + (spacingX - 100);
      });
    });

    // 3. Create semantic group boundary nodes (Task 4)
    // We only create groups if there are nodes in those layers to prevent empty boundaries
    const groupTypes: Array<{ key: keyof typeof layers; label: string; id: string }> = [
      { key: 'presentation', label: 'Presentation Layer', id: 'group_presentation' },
      { key: 'application', label: 'Application Layer', id: 'group_application' },
      { key: 'business', label: 'Business Logic Layer', id: 'group_business' },
      { key: 'data', label: 'Data Storage Layer', id: 'group_data' }
    ];

    groupTypes.forEach(g => {
      const layerNodes = layers[g.key];
      if (layerNodes.length === 0) return;

      // Find boundaries of nodes in this layer
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      layerNodes.forEach(node => {
        const pos = absolutePositions.get(node.id) || { x: 100, y: 100 };
        const w = getNodeWidth(node);
        const h = getNodeHeight(node);
        if (pos.x < minX) minX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.x + w > maxX) maxX = pos.x + w;
        if (pos.y + h > maxY) maxY = pos.y + h;
      });

      const groupWidth = maxX - minX + padding * 2;
      const groupHeight = maxY - minY + padding * 2;
      const groupX = minX - padding;
      const groupY = minY - padding;

      // Add group node
      finalNodes.push({
        id: g.id,
        type: 'group',
        label: g.label,
        position: { x: groupX, y: groupY },
        width: groupWidth,
        height: groupHeight,
        style: {
          borderWidth: 2,
          borderRadius: 16,
          backgroundColor: '#0F172A/5'
        }
      });

      // Update child positions to be relative to the group container
      layerNodes.forEach(node => {
        const absPos = absolutePositions.get(node.id) || { x: 100, y: 100 };
        finalNodes.push({
          ...node,
          parentId: g.id,
          position: {
            x: absPos.x - groupX,
            y: absPos.y - groupY
          }
        });
      });
    });

    // Add external nodes that don't belong to layers directly
    layers.external.forEach(node => {
      const absPos = absolutePositions.get(node.id) || { x: 100, y: 500 };
      finalNodes.push({
        ...node,
        position: absPos
      });
    });

    return finalNodes;
  }

  /**
   * Helper to estimate database node dimensions from columns and data types
   */
  private getDatabaseNodeDimensions(n: DiagramNode): { width: number; height: number; columns: any[] } {
    const label = n.label || '';
    const columns = (n.data?.columns || []) as any[];

    let maxColWidth = 0;
    columns.forEach((col: any) => {
      const isPk = col.primaryKey || col.isPrimaryKey;
      const isFk = col.foreignKey || col.isForeignKey;
      const isUniq = col.unique || col.isUnique;
      const isNull = col.nullable;
      const defVal = col.default;

      const pkFkLen = (isPk ? 3 : 0) + (isFk ? 3 : 0) + (isUniq ? 3 : 0);
      const nameLen = (col.name || '').length;
      const typeLen = `${col.type || 'VARCHAR'}${isNull ? ' NULL' : ''}${defVal !== undefined ? ' =' + defVal : ''}`.length;
      const required = (pkFkLen + nameLen + typeLen + 3) * 7.5 + 32;
      if (required > maxColWidth) maxColWidth = required;
    });

    const headerTextWidth = (label.length + 5) * 8 + 32;
    const width = Math.max(256, headerTextWidth, maxColWidth);

    const headerHeight = 40;
    const rowHeight = 22;
    const padding = 24;
    const height = Math.max(76, headerHeight + columns.length * rowHeight + padding);

    return { width, height, columns };
  }

  /**
   * Helper to estimate UML node dimensions from class signature, properties, and methods
   */
  private getUMLNodeDimensions(n: DiagramNode): { width: number; height: number } {
    const label = n.label || '';
    const isInterface = n.type === 'interface';
    const properties = (n.data?.properties || (n as any).properties || {}) as Record<string, string>;
    const methods = ((n.data as any)?.methods || (n as any).methods || []) as any[];

    let maxTextLen = label.length + (isInterface ? 14 : 0);
    Object.entries(properties).forEach(([name, type]) => {
      const len = name.length + String(type).length + 6;
      if (len > maxTextLen) maxTextLen = len;
    });
    methods.forEach((m: any) => {
      const sig = typeof m === 'string' ? m : `${m.visibility || '+'}${m.name || ''}()${m.returnType ? ': ' + m.returnType : ''}`;
      if (sig.length > maxTextLen) maxTextLen = sig.length;
    });

    const charWidth = 7;
    const padding = 32;
    const width = Math.max(200, maxTextLen * charWidth + padding);

    const headerHeight = 36;
    const rowHeight = 18;
    const compartmentDividerHeight = 10;
    const propertyCount = Object.keys(properties).length;
    const methodCount = methods.length;

    const height = headerHeight + 
                    (propertyCount * rowHeight) + 
                    (methodCount * rowHeight) + 
                    compartmentDividerHeight + 
                    16;

    return { width, height };
  }

  /**
   * Helper to estimate flowchart node dimensions from text and shape type
   */
  private getFlowchartNodeDimensions(n: DiagramNode): { width: number; height: number; nodeType: string } {
    const label = n.label || '';
    const type = (n.type || '').toLowerCase();

    const isDecision = type === 'decision' || label.includes('?') || label.toLowerCase().includes('decision');
    const isTerminal = type === 'terminal' || label.toLowerCase() === 'start' || label.toLowerCase() === 'end' || label.toLowerCase() === 'exit' || label.toLowerCase() === 'stop';
    const isDatabase = type === 'database' || type === 'database-cylinder' || label.toLowerCase().includes('database') || label.toLowerCase().includes(' store') || label.toLowerCase() === 'db';
    const isInputOutput = type === 'input-output' || type === 'parallelogram' || label.toLowerCase().includes('input') || label.toLowerCase().includes('output') || label.toLowerCase().includes('read') || label.toLowerCase().includes('write');
    const isDocument = type === 'document' || label.toLowerCase().includes('doc') || label.toLowerCase().includes('report') || label.toLowerCase().includes('pdf');

    if (isDecision) {
      const lines = wrapTextBackend(label, 14);
      const width = Math.max(144, lines.length * 28);
      return { width, height: width, nodeType: 'decision' };
    }
    if (isTerminal) {
      const lines = wrapTextBackend(label, 16);
      const height = Math.max(44, 20 + lines.length * 16);
      const maxLineLen = Math.max(...lines.map(l => l.length), 5);
      const width = Math.max(144, 32 + maxLineLen * 7.5);
      return { width, height, nodeType: 'terminal' };
    }
    if (isDatabase) {
      return { width: 144, height: 96, nodeType: 'database-cylinder' };
    }
    if (isInputOutput) {
      return { width: 176, height: 60, nodeType: 'input-output' };
    }
    if (isDocument) {
      return { width: 160, height: 72, nodeType: 'document' };
    }

    const lines = wrapTextBackend(label, 20);
    const height = Math.max(52, 24 + lines.length * 16);
    const maxLineLen = Math.max(...lines.map(l => l.length), 5);
    const width = Math.max(144, 32 + maxLineLen * 7.5);
    return { width, height, nodeType: 'process' };
  }

  private async layoutDatabaseER(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    const finalNodes: DiagramNode[] = [];
    const colsCount = Math.min(Math.ceil(Math.sqrt(nodes.length)), 3); // Max 3 columns
    
    // 1. Assign dynamic widths and heights, and normalize columns list
    nodes.forEach(node => {
      const dims = this.getDatabaseNodeDimensions(node);
      node.width = dims.width;
      node.height = dims.height;
      
      // Make sure the columns list is exposed in node.data for the frontend and exporter
      if (!node.data) node.data = {};
      node.data.columns = dims.columns;
    });

    // 2. Track dynamic column widths and row heights
    const colMaxWidths: number[] = [];
    const rowMaxHeights: number[] = [];
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / colsCount);
      const col = index % colsCount;
      colMaxWidths[col] = Math.max(colMaxWidths[col] || 0, node.width || 256);
      rowMaxHeights[row] = Math.max(rowMaxHeights[row] || 0, node.height || 140);
    });

    // 3. Position nodes overlap-free based on tracked grid columns/rows metrics
    nodes.forEach((node, index) => {
      const row = Math.floor(index / colsCount);
      const col = index % colsCount;
      
      let xOffset = 100;
      for (let c = 0; c < col; c++) {
        xOffset += colMaxWidths[c] + 120; // 120px column gap
      }

      let yOffset = 100;
      for (let r = 0; r < row; r++) {
        yOffset += rowMaxHeights[r] + 100; // 100px row gap
      }

      finalNodes.push({
        ...node,
        position: {
          x: xOffset,
          y: yOffset
        }
      });
    });

    return finalNodes;
  }

  /**
   * Layout Strategy for Flowcharts (top-to-bottom directional flows).
   */
  private async layoutFlowchart(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    const finalNodes: DiagramNode[] = [];
    const ranks = new Map<string, number>();
    nodes.forEach(n => ranks.set(n.id, 0));

    // 1. Assign widths, heights, and types
    nodes.forEach(node => {
      const dims = this.getFlowchartNodeDimensions(node);
      node.width = dims.width;
      node.height = dims.height;
      node.type = dims.nodeType;
    });

    // Topological rank resolution
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      edges.forEach(edge => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) rankGroups.set(rank, []);
      rankGroups.get(rank)!.push(nodeId);
    });

    // Track Y offset to lay out ranks vertically without overlap
    let currentY = 100;

    rankGroups.forEach((nodeIds, rank) => {
      // Find the maximum height of nodes in the current rank
      let maxRankHeight = 0;
      nodeIds.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.height) {
          maxRankHeight = Math.max(maxRankHeight, node.height);
        }
      });

      // Layout horizontally within rank
      const totalWidth = nodeIds.reduce((acc, nodeId, idx) => {
        const node = nodes.find(n => n.id === nodeId);
        const w = node?.width || 176;
        return acc + w + (idx < nodeIds.length - 1 ? spacingX - 100 : 0);
      }, 0);
      
      const startX = 200 - totalWidth / 2;

      let currentX = startX;
      nodeIds.forEach((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const w = node.width || 176;
          const h = node.height || 52;
          
          finalNodes.push({
            ...node,
            position: {
              x: currentX,
              // Centered vertically in the rank space
              y: currentY + (maxRankHeight - h) / 2
            }
          });
          currentX += w + (spacingX - 100);
        }
      });

      currentY += maxRankHeight + spacingY - 40; // Spacing to next rank
    });

    return finalNodes;
  }

  /**
   * Layout Strategy for UML class trees.
   */
  private async layoutUML(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    nodes.forEach(node => {
      const dims = this.getUMLNodeDimensions(node);
      node.width = dims.width;
      node.height = dims.height;
    });
    // UML layout resolves inheritance tree top-to-bottom (parents on top)
    return this.layoutFlowchart(nodes, edges, spacingX + 40, spacingY + 30);
  }

  /**
   * Layout Strategy for Cloud infrastructure components with semantic containers.
   */
  private async layoutCloud(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    spacingX: number,
    spacingY: number,
    padding: number
  ): Promise<DiagramNode[]> {
    // 1. Identify all containers
    const containers = nodes.filter(n => n.type === 'container' || n.type === 'group' || n.label.toLowerCase() === 'vpc' || n.label.toLowerCase().includes('subnet'));
    
    // Set type to 'container' for all detected containers
    containers.forEach(c => {
      c.type = 'container';
    });

    const resources = nodes.filter(n => !containers.some(c => c.id === n.id));

    // 2. Resolve parentId for all nodes based on explicit parentId or heuristics
    const vpc = containers.find(c => c.id === 'vpc' || c.label.toLowerCase() === 'vpc');
    const publicSubnet = containers.find(c => c.id === 'public_subnet' || c.label.toLowerCase().includes('public'));
    const privateSubnet = containers.find(c => c.id === 'private_subnet' || c.label.toLowerCase().includes('private'));

    resources.forEach(node => {
      if (!node.parentId) {
        const label = node.label.toLowerCase();
        const type = (node.type || '').toLowerCase();
        
        if (label.includes('internet gateway') || label.includes('igw') || label.includes('client') || label.includes('user')) {
          if (vpc) node.parentId = vpc.id;
        } else if (
          label.includes('public') || 
          label.includes('load balancer') || 
          label.includes('elb') || 
          label.includes('alb') || 
          label.includes('web') || 
          label.includes('nginx') || 
          type === 'frontend'
        ) {
          if (publicSubnet) node.parentId = publicSubnet.id;
          else if (vpc) node.parentId = vpc.id;
        } else {
          if (privateSubnet) node.parentId = privateSubnet.id;
          else if (vpc) node.parentId = vpc.id;
        }
      }
    });

    // Make sure subnets are children of VPC
    containers.forEach(c => {
      if (c.id !== 'vpc' && c.label.toLowerCase() !== 'vpc' && vpc) {
        if (!c.parentId) c.parentId = vpc.id;
      }
    });

    // 3. Helper to layout a container and return its width and height
    const layoutContainer = (container: DiagramNode) => {
      const children = nodes.filter(n => n.parentId === container.id);
      if (children.length === 0) {
        container.width = 300;
        container.height = 200;
        return;
      }

      // Lay out child containers first recursively
      children.forEach(child => {
        if (containers.some(c => c.id === child.id)) {
          layoutContainer(child);
        } else {
          child.width = child.width || (child.type === 'database' || child.label.toLowerCase().includes('database') ? 256 : 208);
          child.height = child.height || (child.type === 'database' || child.label.toLowerCase().includes('database') ? 140 : 76);
        }
      });

      // Now layout children inside this container
      const isSubnet = container.label.toLowerCase().includes('subnet');
      const isVpc = container.label.toLowerCase() === 'vpc' || container.id === 'vpc';

      if (isSubnet) {
        let currentX = padding;
        let maxHeight = 0;
        children.forEach(child => {
          child.position = { x: currentX, y: padding + 20 };
          currentX += (child.width || 208) + 60;
          maxHeight = Math.max(maxHeight, child.height || 76);
        });
        container.width = Math.max(300, currentX + padding - 60);
        container.height = maxHeight + padding * 2 + 20;
      } else if (isVpc) {
        const directVpcChildren = children.filter(c => !containers.some(parent => parent.id === c.id));
        const subnetChildren = children.filter(c => containers.some(parent => parent.id === c.id));

        let currentY = padding + 30;
        let maxW = 300;

        directVpcChildren.forEach(child => {
          maxW = Math.max(maxW, child.width || 208);
          child.position = {
            x: padding + 20,
            y: currentY
          };
          currentY += (child.height || 76) + 40;
        });

        subnetChildren.forEach(child => {
          maxW = Math.max(maxW, child.width || 300);
          child.position = {
            x: padding,
            y: currentY
          };
          currentY += (child.height || 200) + 40;
        });

        subnetChildren.forEach(child => {
          child.width = maxW;
        });

        container.width = maxW + padding * 2;
        container.height = currentY + padding - 20;
      } else {
        const cols = Math.min(Math.ceil(Math.sqrt(children.length)), 3);
        let currentX = padding;
        let currentY = padding + 20;
        let rowMaxH = 0;
        let maxW = 200;

        children.forEach((child, idx) => {
          const col = idx % cols;
          if (col === 0 && idx > 0) {
            currentX = padding;
            currentY += rowMaxH + 40;
            rowMaxH = 0;
          }
          child.position = { x: currentX, y: currentY };
          currentX += (child.width || 208) + 40;
          rowMaxH = Math.max(rowMaxH, child.height || 76);
          maxW = Math.max(maxW, currentX);
        });

        container.width = maxW + padding;
        container.height = currentY + rowMaxH + padding;
      }
    };

    // 4. Run layout for all root containers
    const rootContainers = containers.filter(c => !c.parentId);
    let startX = 100;
    rootContainers.forEach(container => {
      layoutContainer(container);
      container.position = { x: startX, y: 100 };
      startX += (container.width || 400) + 120;
    });

    // 5. Position disconnected non-container nodes that are outside any parent
    let externalY = 100;
    resources.forEach(node => {
      if (!node.parentId) {
        node.width = node.width || 208;
        node.height = node.height || 76;
        node.position = {
          x: startX,
          y: externalY
        };
        externalY += node.height + 60;
      }
    });

    // 6. Return final processed nodes list in z-index order
    const finalNodes: DiagramNode[] = [];
    containers.forEach(c => finalNodes.push(c));
    resources.forEach(r => finalNodes.push(r));

    return finalNodes;
  }

  /**
   * Layout Strategy for API gateways pipeline.
   */
  private async layoutAPI(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    const finalNodes: DiagramNode[] = [];
    const ranks = new Map<string, number>();
    nodes.forEach(n => ranks.set(n.id, 0));

    // Assign sizes first
    nodes.forEach(node => {
      const type = (node.type || '').toLowerCase();
      if (type.includes('db') || type.includes('sql') || type.includes('er') || type.includes('database') || type === 'table') {
        const dims = this.getDatabaseNodeDimensions(node);
        node.width = dims.width;
        node.height = dims.height;
        if (!node.data) node.data = {};
        node.data.columns = dims.columns;
      } else if (type === 'class' || type === 'interface') {
        const dims = this.getUMLNodeDimensions(node);
        node.width = dims.width;
        node.height = dims.height;
      } else {
        node.width = Math.max(176, node.label.length * 7.5 + 32);
        node.height = 76;
      }
    });

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      edges.forEach(edge => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    const rankGroups = new Map<number, string[]>();
    ranks.forEach((rank, nodeId) => {
      if (!rankGroups.has(rank)) rankGroups.set(rank, []);
      rankGroups.get(rank)!.push(nodeId);
    });

    let currentX = 100;
    const verticalGap = spacingY - 40;

    rankGroups.forEach((nodeIds, rank) => {
      // Find the maximum height of nodes in the current rank to center them
      const totalHeight = nodeIds.reduce((acc, nodeId, idx) => {
        const node = nodes.find(n => n.id === nodeId);
        const h = node?.height || 76;
        return acc + h + (idx < nodeIds.length - 1 ? verticalGap : 0);
      }, 0);

      const startY = 250 - totalHeight / 2;
      let maxW = 208;

      let currentY = startY;
      nodeIds.forEach((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const w = node.width || 208;
          const h = node.height || 76;
          maxW = Math.max(maxW, w);
          
          finalNodes.push({
            ...node,
            position: {
              x: currentX,
              y: currentY
            }
          });
          currentY += h + verticalGap;
        }
      });

      currentX += maxW + 140; // 140px gap to next rank
    });

    return finalNodes;
  }

  /**
   * Layout Strategy for AI/ML dataset pipelines.
   */
  private async layoutAIML(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    nodes.forEach(node => {
      node.width = 208;
      node.height = 76;
    });

    if (nodes.length <= 5) {
      return this.layoutAPI(nodes, edges, spacingX, spacingY);
    }

    const ranks = new Map<string, number>();
    nodes.forEach(n => ranks.set(n.id, 0));

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      edges.forEach(edge => {
        const sourceRank = ranks.get(edge.source) || 0;
        const targetRank = ranks.get(edge.target) || 0;
        if (targetRank <= sourceRank) {
          ranks.set(edge.target, sourceRank + 1);
          changed = true;
        }
      });
    }

    const sortedNodes = [...nodes].sort((a, b) => (ranks.get(a.id) || 0) - (ranks.get(b.id) || 0));

    const finalNodes: DiagramNode[] = [];
    const cols = 4;
    const gapX = 140;
    const gapY = 120;

    sortedNodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      node.position = {
        x: 100 + col * (208 + gapX),
        y: 100 + row * (76 + gapY)
      };
      finalNodes.push(node);
    });

    return finalNodes;
  }

  /**
   * Layout Strategy for UML Sequence Diagrams.
   */
  private async layoutSequence(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    const finalNodes: DiagramNode[] = [];
    const actorNodes = nodes.filter(n => n.type === 'sequence' || n.type === 'sequenceActor');
    const actorSpacing = spacingX || 280;

    // Position actors
    actorNodes.forEach((actor, idx) => {
      actor.position = { x: idx * actorSpacing + 50, y: 30 };
      actor.width = 160;
      actor.height = 60;
      actor.type = 'sequenceActor';
      finalNodes.push(actor);
    });

    // Translate sequential message edges to sequenceMessage nodes positioned vertically
    edges.forEach((edge, idx) => {
      const sourceActorIdx = actorNodes.findIndex(a => a.id === edge.source);
      const targetActorIdx = actorNodes.findIndex(a => a.id === edge.target);
      if (sourceActorIdx >= 0 && targetActorIdx >= 0) {
        const sourceX = sourceActorIdx * actorSpacing + 50 + 80;
        const targetX = targetActorIdx * actorSpacing + 50 + 80;
        const x = Math.min(sourceX, targetX) + Math.abs(sourceX - targetX) / 2;
        const y = (idx + 1) * 90 + 100;

        const msgNodeId = `msg-node-${edge.id}`;
        if (!nodes.some(n => n.id === msgNodeId)) {
          finalNodes.push({
            id: msgNodeId,
            type: 'sequenceMessage',
            label: edge.label || 'Message',
            position: { x: x - 90, y },
            width: 180,
            height: 40,
            data: {
              label: edge.label || 'Message',
              isReturn: edge.type === 'dashed' || edge.type === 'dependency',
              direction: targetX > sourceX ? 'right' : 'left'
            }
          });
        }
      }
    });

    // Add any other nodes
    nodes.forEach(n => {
      if (!finalNodes.some(fn => fn.id === n.id)) {
        finalNodes.push(n);
      }
    });

    return finalNodes;
  }

  /**
   * Layout Strategy for Mindmaps (radial tree flow).
   */
  private async layoutMindmap(nodes: DiagramNode[], edges: DiagramEdge[], spacingX: number, spacingY: number): Promise<DiagramNode[]> {
    const finalNodes: DiagramNode[] = [];
    if (nodes.length === 0) return [];

    // 1. Find root node (node with no parent and no incoming edges)
    let root = nodes.find(n => !n.parentId && !edges.some(e => e.target === n.id));
    if (!root) root = nodes[0];

    const getChildren = (parentId: string): DiagramNode[] => {
      const childIds = edges.filter(e => e.source === parentId).map(e => e.target);
      return nodes.filter(n => childIds.includes(n.id));
    };

    const rootX = 600;
    const rootY = 400;

    root.position = { x: rootX, y: rootY };
    root.width = 180;
    root.height = 60;
    finalNodes.push(root);

    const rootChildren = getChildren(root.id);
    
    rootChildren.forEach((child, idx) => {
      const isRight = idx % 2 === 0;
      const direction = isRight ? 1 : -1; 
      const x = rootX + direction * 280;
      const y = rootY + (Math.floor(idx / 2) - (rootChildren.length - 1) / 4) * 160;

      child.position = { x, y };
      child.width = 160;
      child.height = 50;
      finalNodes.push(child);

      const subChildren = getChildren(child.id);
      subChildren.forEach((sub, sIdx) => {
        const sx = x + direction * 240;
        const sy = y + (sIdx - (subChildren.length - 1) / 2) * 80;

        sub.position = { x: sx, y: sy };
        sub.width = 140;
        sub.height = 44;
        finalNodes.push(sub);
      });
    });

    // Handle any orphan nodes
    nodes.forEach(n => {
      if (!finalNodes.some(fn => fn.id === n.id)) {
        n.position = { x: rootX, y: rootY + 300 };
        n.width = 140;
        n.height = 44;
        finalNodes.push(n);
      }
    });

    return finalNodes;
  }

  /**
   * Sanity checks and shifts nodes to guarantee no overlap occurs.
   */
  private preventNodeOverlaps(nodes: DiagramNode[], spacingX: number, spacingY: number) {
    const thresholdX = 160;
    const thresholdY = 60;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        // Skip absolute bounds overlap check if they belong to different parent container groups
        if (nodeA.parentId !== nodeB.parentId) continue;

        const dx = Math.abs(nodeA.position.x - nodeB.position.x);
        const dy = Math.abs(nodeA.position.y - nodeB.position.y);

        if (dx < thresholdX && dy < thresholdY) {
          // Resolve overlap by shifting node B horizontally or vertically
          if (dx < thresholdX) {
            nodeB.position.x += spacingX - dx;
          } else {
            nodeB.position.y += spacingY - dy;
          }
        }
      }
    }
  }
}
