import type { NormalizedLayoutGraph } from './types';
import { getAbsolutePosition, getNodeWidth, getNodeHeight, type ViewportBounds } from './ExportBoundsCalculator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ExportValidator {
  static validate(graph: NormalizedLayoutGraph, bounds: ViewportBounds): ValidationResult {
    const errors: string[] = [];

    if (graph.nodes.length === 0) {
      errors.push('Validation Error: The layout graph contains zero nodes.');
    }

    graph.nodes.forEach((node) => {
      const absPos = getAbsolutePosition(node, graph.nodes);
      if (isNaN(absPos.x) || isNaN(absPos.y)) {
        errors.push(`Validation Error: Node [${node.id}] has NaN absolute coordinates.`);
      }
      if (!isFinite(absPos.x) || !isFinite(absPos.y)) {
        errors.push(`Validation Error: Node [${node.id}] has non-finite (Infinity) absolute coordinates.`);
      }

      const w = getNodeWidth(node);
      const h = getNodeHeight(node);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        errors.push(`Validation Error: Node [${node.id}] has invalid dimensions (width: ${w}, height: ${h}).`);
      }
    });

    graph.edges.forEach((edge) => {
      const sourceExists = graph.nodes.some((n) => n.id === edge.source);
      const targetExists = graph.nodes.some((n) => n.id === edge.target);

      if (!sourceExists) {
        errors.push(`Validation Error: Edge [${edge.id}] references non-existent source node [${edge.source}].`);
      }
      if (!targetExists) {
        errors.push(`Validation Error: Edge [${edge.id}] references non-existent target node [${edge.target}].`);
      }
    });

    if (isNaN(bounds.width) || isNaN(bounds.height) || bounds.width <= 0 || bounds.height <= 0) {
      errors.push(`Validation Error: Viewport bounds calculation failed (width: ${bounds.width}, height: ${bounds.height}).`);
    }
    if (!isFinite(bounds.width) || !isFinite(bounds.height)) {
      errors.push(`Validation Error: Viewport bounds size is non-finite (width: ${bounds.width}, height: ${bounds.height}).`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
