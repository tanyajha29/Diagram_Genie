import type { ExportEdge, NormalizedLayoutGraph, ExportColorTheme } from './types';

import { ExportEdgeRouter } from './ExportEdgeRouter';

export class ExportEdgeRenderer {
  static renderDefs(theme: ExportColorTheme): string {
    return `
      <!-- Connection Arrow markers -->
      <marker id="arrowclosed" 
              viewBox="0 0 10 10" 
              refX="8" 
              refY="5" 
              markerWidth="6" 
              markerHeight="6" 
              orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${theme.edge}" stroke="${theme.edge}" stroke-width="1" />
      </marker>
    `;
  }

  static render(
    edge: ExportEdge,
    graph: NormalizedLayoutGraph,
    theme: ExportColorTheme,
    diagramType: string
  ): string {
    const points = ExportEdgeRouter.route(edge, graph, diagramType);
    if (points.length < 2) return '';

    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    const isDashed = edge.type === 'dashed' || edge.id.includes('dash');
    const borderStyle = isDashed ? 'stroke-dasharray="5,5"' : '';
    const animatedStyle = edge.animated ? 'stroke-linecap="round"' : '';

    let labelSvg = '';
    if (edge.label) {
      let midIdx = Math.floor(points.length / 2);
      const p1 = points[midIdx - 1];
      const p2 = points[midIdx];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const textLen = edge.label.length * 6;
      const textHeight = 16;

      labelSvg = `
        <g class="react-flow__edge-label-group">
          <rect x="${midX - textLen / 2 - 4}" y="${midY - textHeight / 2}" 
                width="${textLen + 8}" height="${textHeight}" rx="4" ry="4" 
                fill="${theme.background}" stroke="${theme.containerBorder}" stroke-width="0.5" />
          <text x="${midX}" y="${midY + 4}" font-family="monospace, sans-serif" font-size="9" 
                font-weight="bold" fill="${theme.mutedText}" text-anchor="middle">
            ${edge.label}
          </text>
        </g>
      `;
    }

    return `
      <!-- Connection edge: ${edge.source} -> ${edge.target} -->
      <g id="${edge.id}" class="react-flow__edge">
        <path d="${pathData}" 
              stroke="${theme.edge}" 
              stroke-width="2.5" 
              stroke-opacity="1" 
              fill="none" 
              marker-end="url(#arrowclosed)" 
              ${borderStyle} 
              ${animatedStyle} />
        ${labelSvg}
      </g>
    `;
  }
}
