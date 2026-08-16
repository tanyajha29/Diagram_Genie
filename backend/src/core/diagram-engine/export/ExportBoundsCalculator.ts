import type { ExportNode, NormalizedLayoutGraph } from './types';


export interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  viewBox: string;
  padding: number;
}

export function getAbsolutePosition(node: ExportNode, nodes: ExportNode[]): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let parentId = node.parentId;
  while (parentId) {
    const parent = nodes.find(n => n.id === parentId);
    if (parent) {
      x += parent.position.x;
      y += parent.position.y;
      parentId = parent.parentId;
    } else {
      break;
    }
  }
  return { x, y };
}

export function getNodeWidth(node: ExportNode): number {
  if (node.width) return node.width;
  if (node.type === 'group' || node.type === 'container') return 300;
  if (node.type === 'database' || node.label.toLowerCase().includes('database')) return 256;
  return 208;
}

export function getNodeHeight(node: ExportNode): number {
  if (node.height) return node.height;
  if (node.type === 'group' || node.type === 'container') return 200;
  if (node.type === 'database' || node.label.toLowerCase().includes('database')) return 140;
  return 76;
}

export class ExportBoundsCalculator {
  static calculate(graph: NormalizedLayoutGraph, padding = 48): ViewportBounds {
    if (graph.nodes.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
        width: 100,
        height: 100,
        viewBox: '0 0 100 100',
        padding,
      };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    graph.nodes.forEach((node) => {
      const absPos = getAbsolutePosition(node, graph.nodes);
      const w = getNodeWidth(node);
      const h = getNodeHeight(node);

      if (absPos.x < minX) minX = absPos.x;
      if (absPos.y < minY) minY = absPos.y;
      if (absPos.x + w > maxX) maxX = absPos.x + w;
      if (absPos.y + h > maxY) maxY = absPos.y + h;
    });

    graph.edges.forEach((edge) => {
      const sNode = graph.nodes.find(n => n.id === edge.source);
      const tNode = graph.nodes.find(n => n.id === edge.target);
      if (sNode && tNode) {
        const sPos = getAbsolutePosition(sNode, graph.nodes);
        const tPos = getAbsolutePosition(tNode, graph.nodes);
        
        const midX = (sPos.x + tPos.x) / 2;
        const midY = (sPos.y + tPos.y) / 2;

        if (midX < minX) minX = midX;
        if (midY < minY) minY = midY;
        if (midX > maxX) maxX = midX;
        if (midY > maxY) maxY = midY;
      }
    });

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    const width = graphWidth + padding * 2;
    const height = graphHeight + padding * 2;

    const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      viewBox,
      padding,
    };
  }
}
