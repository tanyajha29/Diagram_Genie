import React, { useState } from 'react';
import { X, Image, FileText, Code, Check, Loader, Download } from 'lucide-react';
import { useDiagramStore } from '../../store/diagramStore';
import { toPng, toSvg } from 'html-to-image';
import { motion } from 'framer-motion';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { title, nodes, edges } = useDiagramStore();
  const [exporting, setExporting] = useState(false);
  const [completed, setCompleted] = useState<string | null>(null);

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

    setTimeout(() => {
      try {
        if (format === 'json') {
          const exportData = JSON.stringify({ title, nodes, edges }, null, 2);
          triggerDownload(exportData, `${title.replace(/\s+/g, '_')}_diagram.json`, 'application/json');
        } else if (format === 'mermaid') {
          // Compile a mock Mermaid format syntax
          let mermaidText = 'graph TD\n';
          nodes.forEach((node) => {
            mermaidText += `  ${node.id}["${node.data.label}"]\n`;
          });
          edges.forEach((edge) => {
            mermaidText += `  ${edge.source} --> ${edge.target}\n`;
          });
          triggerDownload(mermaidText, `${title.replace(/\s+/g, '_')}_mermaid.txt`, 'text/plain');
        } else if (format === 'png' || format === 'svg') {
          // Attempt to export the viewport using html-to-image
          const element = document.querySelector('.react-flow__viewport') as HTMLElement;
          if (element) {
            if (format === 'png') {
              toPng(element, { backgroundColor: '#ffffff', quality: 0.95 }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '_')}.png`;
                link.href = dataUrl;
                link.click();
              });
            } else {
              toSvg(element, { backgroundColor: '#ffffff' }).then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '_')}.svg`;
                link.href = dataUrl;
                link.click();
              });
            }
          } else {
            // Fallback download if viewport ref not found
            triggerDownload(JSON.stringify({ nodes, edges }), `${title}.json`, 'application/json');
          }
        } else {
          // Simulate PDF/PlantUML exports
          alert(`Preparing print layout for ${format.toUpperCase()} export...`);
        }

        setCompleted(format);
      } catch (err) {
        console.error('Export failed:', err);
      } finally {
        setExporting(false);
      }
    }, 1200); // 1.2s export loading effect
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
                className="w-full text-left p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/20 hover:border-brand-orange/30 hover:bg-white/80 dark:hover:bg-slate-900/40 flex items-center justify-between transition-all"
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
