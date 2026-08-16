import type { NormalizedLayoutGraph, ExportOptions } from '../../../../backend/src/core/diagram-engine/export/types';
import { SvgExportRenderer } from '../../../../backend/src/core/diagram-engine/export/SvgExportRenderer';
import { ExportSerializer } from './ExportSerializer';
import { ExportBoundsCalculator } from '../../../../backend/src/core/diagram-engine/export/ExportBoundsCalculator';

export class ExportRenderer {
  /**
   * Compiles the layout graph into a standalone vector SVG document string
   */
  static renderSvg(graph: NormalizedLayoutGraph, options: ExportOptions): string {
    return SvgExportRenderer.render(graph, options);
  }

  /**
   * Generates and downloads the diagram as an SVG vector file
   */
  static downloadSvg(graph: NormalizedLayoutGraph, filename: string, options: ExportOptions) {
    const svgString = this.renderSvg(graph, options);
    ExportSerializer.downloadText(svgString, filename);
  }

  /**
   * Rasterizes and downloads the diagram as a high-resolution PNG image
   */
  static async downloadPng(graph: NormalizedLayoutGraph, filename: string, options: ExportOptions): Promise<void> {
    const svgString = this.renderSvg(graph, options);
    const bounds = ExportBoundsCalculator.calculate(graph, options.padding || 48);
    await ExportSerializer.exportToPng(svgString, bounds.width, bounds.height, filename);
  }
}
