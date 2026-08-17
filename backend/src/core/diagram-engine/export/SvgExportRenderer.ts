import type { NormalizedLayoutGraph, ExportOptions } from './types';

import { ExportBoundsCalculator } from './ExportBoundsCalculator';
import { ExportStyleResolver } from './ExportStyleResolver';
import { ExportNodeRenderer } from './ExportNodeRenderer';
import { ExportEdgeRenderer } from './ExportEdgeRenderer';
import { ExportValidator } from './ExportValidator';

export class SvgExportRenderer {
  static render(graph: NormalizedLayoutGraph, options: ExportOptions): string {
    const bounds = ExportBoundsCalculator.calculate(graph, options.padding || 48);

    const validation = ExportValidator.validate(graph, bounds);
    if (!validation.isValid) {
      throw new Error(`Export Validation failed:\n${validation.errors.join('\n')}`);
    }

    const theme = ExportStyleResolver.resolve(options.theme);

    const groupNodes = graph.nodes.filter(n => n.type === 'group' || n.type === 'container');
    const dataNodes = graph.nodes.filter(n => n.type !== 'group' && n.type !== 'container');

    const diagramType = graph.metadata?.sourceType || 'architecture';

    const bgRect = `<rect width="100%" height="100%" fill="${theme.background}" />`;
    const defs = `<defs>${ExportEdgeRenderer.renderDefs(theme)}</defs>`;

    let groupsMarkup = '';
    groupNodes.forEach((node) => {
      groupsMarkup += ExportNodeRenderer.render(node, graph.nodes, theme, diagramType);
    });

    let edgesMarkup = '';
    graph.edges.forEach((edge) => {
      edgesMarkup += ExportEdgeRenderer.render(edge, graph, theme, diagramType);
    });

    let nodesMarkup = '';
    dataNodes.forEach((node) => {
      nodesMarkup += ExportNodeRenderer.render(node, graph.nodes, theme, diagramType);
    });

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="${bounds.viewBox}" 
     width="${bounds.width}" 
     height="${bounds.height}" 
     style="background-color: ${theme.background}; font-family: system-ui, -apple-system, sans-serif;">
  ${defs}
  ${bgRect}
  
  <!-- Group Containers Layer -->
  <g class="react-flow__nodes-groups">
    ${groupsMarkup}
  </g>
  
  <!-- Connection Edges Layer -->
  <g class="react-flow__edges">
    ${edgesMarkup}
  </g>
  
  <!-- Node Elements Layer -->
  <g class="react-flow__nodes">
    ${nodesMarkup}
  </g>
</svg>`;
  }
}
