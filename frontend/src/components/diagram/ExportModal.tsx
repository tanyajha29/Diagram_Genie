import React, { useState } from 'react';
import { X, Image, FileText, Code, Check, Loader, Download } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { motion } from 'framer-motion';
import { ExportRenderer } from '../../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { title, nodes, edges, lastDiagnostics, toolId } = useDiagramStore();
  const [exporting, setExporting] = useState(false);
  const [completed, setCompleted] = useState<string | null>(null);
  const [exportTheme, setExportTheme] = useState<'light' | 'dark' | 'neutral'>('light');

  if (!isOpen) return null;

  const triggerDownload = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: string) => {
    setExporting(true);
    setCompleted(null);

    const startTime = Date.now();

    setTimeout(async () => {
      try {
        if (format === 'json') {
          const exportData = JSON.stringify({ title, nodes, edges }, null, 2);
          triggerDownload(exportData, `${title.replace(/\s+/g, '_')}_diagram.json`, 'application/json');
          setCompleted(format);
        } else if (format === 'mermaid') {
          let mermaidText = 'graph TD\n';
          nodes.forEach((node) => {
            mermaidText += `  ${node.id}["${node.data.label}"]\n`;
          });
          edges.forEach((edge) => {
            mermaidText += `  ${edge.source} --> ${edge.target}\n`;
          });
          triggerDownload(mermaidText, `${title.replace(/\s+/g, '_')}_mermaid.txt`, 'text/plain');
          setCompleted(format);
        } else if (format === 'png' || format === 'svg') {
          // Construct normalized layout graph from UDM parameters, decoupled from React Flow (Task 2)
          const normalizedGraph = {
            nodes: nodes.map(n => ({
              id: n.id,
              type: n.type || 'default',
              label: n.data.label as string,
              position: n.position,
              width: n.width,
              height: n.height,
              parentId: n.parentId,
              description: n.data.description as string,
              properties: n.data.properties as any,
              columns: n.data.columns as any,
              data: n.data as any
            })),
            edges: edges.map(e => ({
              id: e.id,
              source: e.source,
              target: e.target,
              type: e.type,
              label: e.label as string,
              animated: e.animated
            })),
            metadata: {
              sourceType: toolId
            }
          };

          if (format === 'png') {
            await ExportRenderer.downloadPng(normalizedGraph, `${title.replace(/\s+/g, '_')}.png`, {
              theme: exportTheme
            });
          } else {
            ExportRenderer.downloadSvg(normalizedGraph, `${title.replace(/\s+/g, '_')}.svg`, {
              theme: exportTheme
            });
          }

          // Record Export Telemetry Diagnostics
          const exportDiagnostics = {
            exportFormat: format,
            exportTheme: exportTheme,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            groupCount: nodes.filter((n) => n.type === 'group' || n.parentId).length,
            exportScale: format === 'png' ? 2 : 1,
            renderDurationMs: Date.now() - startTime,
            warnings: [],
          };

          useDiagramStore.setState({
            lastDiagnostics: {
              ...lastDiagnostics,
              export: exportDiagnostics,
            },
          });

          setCompleted(format);
        }
      } catch (err) {
        console.error('Export capture failed:', err);
        // Fallback JSON workspace file download if renderer fails
        const exportData = JSON.stringify({ title, nodes, edges }, null, 2);
        triggerDownload(exportData, `${title.replace(/\s+/g, '_')}_diagram.json`, 'application/json');
      } finally {
        setExporting(false);
      }
    }, 1200);
  };

  const formats = [
    { id: 'png', label: 'PNG Image', desc: 'High-res raster copy for presentations.', icon: Image, color: 'text-blue-500' },
    { id: 'svg', label: 'SVG Vector', desc: 'Infinite scale vector layout file.', icon: Code, color: 'text-orange-500' },
    { id: 'json', label: 'JSON Layout', desc: 'Raw Diagram Genie workspace config.', icon: FileText, color: 'text-indigo-500' },
    { id: 'mermaid', label: 'Mermaid code', desc: 'Syntax text compatible with markdown.', icon: Code, color: 'text-pink-500' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl glass-effect p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-slate-800 dark:text-white">Export Workspace</h3>
            <p className="text-[10px] text-slate-400">Save your architectural diagram configuration locally.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Export Style</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExportTheme('light')}
              className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                exportTheme === 'light'
                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setExportTheme('dark')}
              className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                exportTheme === 'dark'
                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setExportTheme('neutral')}
              className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer text-center ${
                exportTheme === 'neutral'
                  ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              Neutral
            </button>
          </div>
        </div>

        {/* Options list */}
        <div className="space-y-3">
          {formats.map((fmt) => {
            const isCompleted = completed === fmt.id;
            const Icon = fmt.icon;

            return (
              <button
                key={fmt.id}
                onClick={() => handleExport(fmt.id)}
                disabled={exporting}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/20 hover:border-brand-orange/30 hover:bg-white/80 dark:hover:bg-slate-900/40 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${fmt.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{fmt.label}</p>
                    <p className="text-[10px] text-slate-400 font-normal leading-normal">{fmt.desc}</p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : exporting ? (
                    <Loader className="w-4 h-4 animate-spin text-brand-orange" />
                  ) : (
                    <Download className="w-4 h-4 group-hover:text-brand-orange" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
