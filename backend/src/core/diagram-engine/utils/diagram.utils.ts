import { DiagramEdge } from '../interfaces/edge.interface';

export class DiagramUtils {
  static generateId(prefix: string = 'node'): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static getConnectedEdges(nodeId: string, edges: DiagramEdge[]): DiagramEdge[] {
    return edges.filter(e => e.source === nodeId || e.target === nodeId);
  }
}
