import type { ExportEdge, NormalizedLayoutGraph } from './types';

import { getAbsolutePosition, getNodeWidth, getNodeHeight } from './ExportBoundsCalculator';

export interface Point {
  x: number;
  y: number;
}

export class ExportEdgeRouter {
  static route(
    edge: ExportEdge,
    graph: NormalizedLayoutGraph,
    diagramType: string
  ): Point[] {
    const isHorizontal = ['api', 'aiml', 'pipeline'].some(t => diagramType.toLowerCase().includes(t));

    const sourceNode = graph.nodes.find(n => n.id === edge.source);
    const targetNode = graph.nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      return [];
    }

    const sPos = getAbsolutePosition(sourceNode, graph.nodes);
    const tPos = getAbsolutePosition(targetNode, graph.nodes);

    const sW = getNodeWidth(sourceNode);
    const sH = getNodeHeight(sourceNode);
    const tW = getNodeWidth(targetNode);
    const tH = getNodeHeight(targetNode);

    const points: Point[] = [];

    // Check if there are multiple edges leaving the same source to fan out anchors
    const sourceEdges = graph.edges.filter(e => e.source === edge.source);
    const sourceIndex = sourceEdges.findIndex(e => e.id === edge.id);
    const sourceFanOffset = sourceEdges.length > 1 ? (sourceIndex - (sourceEdges.length - 1) / 2) * 16 : 0;

    // Check if there are multiple edges entering the same target to fan out anchors
    const targetEdges = graph.edges.filter(e => e.target === edge.target);
    const targetIndex = targetEdges.findIndex(e => e.id === edge.id);
    const targetFanOffset = targetEdges.length > 1 ? (targetIndex - (targetEdges.length - 1) / 2) * 16 : 0;

    if (isHorizontal) {
      // Horizontal flow
      const startX = sPos.x + sW;
      const startY = sPos.y + sH / 2 + sourceFanOffset;
      const endX = tPos.x;
      const endY = tPos.y + tH / 2 + targetFanOffset;

      points.push({ x: startX, y: startY });

      if (Math.abs(startY - endY) < 5) {
        points.push({ x: endX, y: endY });
      } else {
        const midX = startX + (endX - startX) / 2;
        points.push({ x: midX, y: startY });
        points.push({ x: midX, y: endY });
        points.push({ x: endX, y: endY });
      }
    } else {
      // Vertical flow (top-to-bottom)
      const startX = sPos.x + sW / 2 + sourceFanOffset;
      const startY = sPos.y + sH;
      const endX = tPos.x + tW / 2 + targetFanOffset;
      const endY = tPos.y;

      points.push({ x: startX, y: startY });

      if (Math.abs(startX - endX) < 5) {
        points.push({ x: endX, y: endY });
      } else {
        // Find intermediate vertical gap routing lane
        const midY = startY + (endY - startY) / 2;
        points.push({ x: startX, y: midY });
        points.push({ x: endX, y: midY });
        points.push({ x: endX, y: endY });
      }
    }

    return points;
  }
}
