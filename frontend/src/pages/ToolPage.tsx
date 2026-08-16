import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { engineConfig } from '../config/tools';
import { useDiagramStore } from '../store/diagramStore';
import { Upload, ClipboardList, FileText, Cpu, ArrowLeft, RefreshCcw, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { initNewDiagram } = useDiagramStore();

  const [engine, setEngine] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<any>(null);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [editorText, setEditorText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to map presets to their format IDs
  const mapPresetToFormatId = (presetId: string): string => {
    const pid = presetId.toLowerCase();
    if (pid === 'prisma-schema-visualizer') return 'prisma-schema';
    if (pid === 'uml-sequence') return 'uml-sequence';
    if (pid === 'docker-compose-visualizer') return 'docker-compose';
    if (pid === 'terraform-infra') return 'terraform';
    if (pid === 'openapi-visualizer') return 'openapi';
    
    if (pid.startsWith('uml-')) return 'uml-dsl';
    if (pid.startsWith('er-') || pid.includes('schema') || pid.includes('db-') || pid.includes('sql-') || pid.includes('postgres') || pid.includes('mysql') || pid.includes('supabase')) return 'sql-ddl';
    if (pid.startsWith('flow') || pid.includes('workflow') || pid.includes('dfd') || pid.includes('process') || pid.includes('tree') || pid.includes('swimlane') || pid.includes('transition')) return 'flow-dsl';
    if (pid.startsWith('aws-') || pid.includes('azure') || pid.includes('kubernetes') || pid.includes('gcp') || pid.includes('helm') || pid.includes('ci-cd')) return 'cloud-dsl';
    if (pid.includes('graphql') || pid.includes('grpc') || pid.includes('api-') || pid.includes('webhook') || pid.includes('rest') || pid.includes('oauth') || pid.includes('queue') || pid.includes('kafka')) return 'api-dsl';
    if (pid.includes('readme') || pid.includes('mindmap') || pid.includes('wiki') || pid.includes('changelog') || pid.includes('feature') || pid.includes('story') || pid.includes('onboarding') || pid.includes('tech-doc')) return 'markdown-outline';
    if (pid.includes('ml-') || pid.includes('rag') || pid.includes('llm') || pid.includes('vector') || pid.includes('neural') || pid.includes('prompt') || pid.includes('inference') || pid.includes('ingestion')) return 'pipeline-dsl';

    return '';
  };

  useEffect(() => {
    if (!toolId) return;

    // 1. Try finding engine by ID
    let foundEngine = engineConfig.engines.find((e) => e.id === toolId);
    let initialPreset = null;

    if (!foundEngine) {
      // 2. Try finding engine containing preset by ID (for backward compatibility)
      foundEngine = engineConfig.engines.find((e) =>
        e.presets.some((p) => p.id === toolId)
      );
      if (foundEngine) {
        initialPreset = foundEngine.presets.find((p) => p.id === toolId);
      }
    }

    if (foundEngine) {
      setEngine(foundEngine);
      
      if (initialPreset) {
        setSelectedPreset(initialPreset);
        setEditorText(initialPreset.sampleData);
        
        // Find corresponding format
        const formatId = mapPresetToFormatId(initialPreset.id);
        const format = foundEngine.formats.find((f) => f.id === formatId) || foundEngine.formats[0];
        setSelectedFormat(format);
      } else {
        // Default to first format and first preset
        const defaultFormat = foundEngine.formats[0];
        const defaultPreset = foundEngine.presets[0];
        
        setSelectedFormat(defaultFormat);
        setSelectedPreset(defaultPreset);
        setEditorText(defaultPreset ? defaultPreset.sampleData : defaultFormat.example);
      }
    } else {
      navigate('/tools');
    }
  }, [toolId, navigate]);

  if (!engine || !selectedFormat) return null;

  const handleFormatChange = (formatId: string) => {
    const format = engine.formats.find((f: any) => f.id === formatId);
    if (format) {
      setSelectedFormat(format);
      
      // Select preset matching new format, or clear preset selection
      const matchingPreset = engine.presets.find((p: any) => mapPresetToFormatId(p.id) === format.id);
      if (matchingPreset) {
        setSelectedPreset(matchingPreset);
        setEditorText(matchingPreset.sampleData);
      } else {
        setSelectedPreset(null);
        setEditorText(format.example);
      }
      setUploadedFiles([]);
    }
  };

  const handlePresetChange = (presetId: string) => {
    if (presetId === 'custom') {
      setSelectedPreset({ id: 'custom', name: 'Custom Layout' });
      setEditorText(selectedFormat.example);
      return;
    }

    const preset = engine.presets.find((p: any) => p.id === presetId);
    if (preset) {
      setSelectedPreset(preset);
      setEditorText(preset.sampleData);
      
      const formatId = mapPresetToFormatId(preset.id);
      const format = engine.formats.find((f: any) => f.id === formatId);
      if (format) {
        setSelectedFormat(format);
      }
      setUploadedFiles([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      // Validate extensions
      const ext = '.' + files[0].name.split('.').pop()?.toLowerCase();
      if (!selectedFormat.extensions.includes(ext)) {
        alert(`Unsupported file format. Please upload a file matching: ${selectedFormat.extensions.join(', ')}`);
        return;
      }
      setUploadedFiles(files);
      const text = await files[0].text();
      setEditorText(text);
      setActiveTab('paste');
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      setUploadedFiles(files);
      const text = await files[0].text();
      setEditorText(text);
      setActiveTab('paste');
    }
  };

  const handleGenerate = () => {
    const presetName = selectedPreset?.name || engine.name;
    
    // Determine the exact parser name required by the format contract
    let parserType = selectedFormat.parser;
    if (parserType === 'sql' || parserType === 'prisma') parserType = 'er';
    else if (parserType === 'uml' || parserType === 'sequence') parserType = 'uml';
    else if (parserType === 'flowchart') parserType = 'flowchart';
    else if (parserType === 'markdown-outline') parserType = 'mindmap';
    else if (parserType === 'cloud' || parserType === 'terraform' || parserType === 'docker-compose') parserType = 'cloud';

    initNewDiagram(engine.id, `${presetName} Workspace`, `Generated from ${selectedFormat.label} schema.`);
    
    navigate('/processing', { 
      state: { 
        text: editorText, 
        parserType, 
        toolId: selectedPreset?.id || engine.id,
        formatId: selectedFormat.id
      } 
    });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-4xl mx-auto space-y-8 py-4"
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/tools')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to catalog</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-extrabold text-brand-navy dark:text-white tracking-tight">
          {engine.name} Workspace
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          {engine.description}
        </p>
      </div>

      {/* Selectors panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
        {/* Format selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Input Format</label>
          <select
            value={selectedFormat.id}
            onChange={(e) => handleFormatChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-orange transition-colors shadow-sm"
          >
            {engine.formats.map((f: any) => (
              <option key={f.id} value={f.id}>{f.label} ({f.extensions.join(', ')})</option>
            ))}
          </select>
        </div>

        {/* Preset selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Preset Templates</label>
          <select
            value={selectedPreset?.id || 'custom'}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-orange transition-colors shadow-sm"
          >
            {engine.presets.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="custom">Custom (Blank Layout)</option>
          </select>
        </div>
      </div>

      {/* Editor & Upload tabs */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="flex bg-slate-100/60 dark:bg-slate-900/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'paste'
                  ? 'bg-white dark:bg-slate-800 text-brand-orange shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-brand-orange'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Paste Text Configuration</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-800 text-brand-orange shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-brand-orange'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Code / Schema</span>
            </button>
          </div>
        </div>

        {/* Tab content panel */}
        <div className="min-h-[380px] rounded-2xl glass-effect shadow-md overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'paste' ? (
              <motion.div
                key="paste-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col justify-between"
              >
                {/* Editor toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {selectedFormat.label} Editor
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (selectedPreset && selectedPreset.id !== 'custom') {
                        setEditorText(selectedPreset.sampleData);
                      } else {
                        setEditorText(selectedFormat.example);
                      }
                    }}
                    className="flex items-center space-x-1 text-[9px] font-bold text-slate-500 hover:text-brand-orange transition-colors"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    <span>Reset Sample</span>
                  </button>
                </div>
                
                {/* Editor container */}
                <div className="flex-grow min-h-[340px] p-2 bg-slate-900">
                  <Editor
                    height="340px"
                    theme="vs-dark"
                    defaultLanguage={selectedFormat.extensions.includes('.json') ? 'json' : 'markdown'}
                    value={editorText}
                    onChange={(val) => setEditorText(val || '')}
                    options={{
                      fontSize: 12,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-[380px] p-8 flex flex-col items-center justify-center"
              >
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all ${
                    dragActive
                      ? 'border-brand-orange bg-brand-orange/5'
                      : 'border-slate-300 dark:border-slate-700 bg-transparent hover:border-brand-orange/40 hover:bg-slate-50/30 dark:hover:bg-slate-900/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept={selectedFormat.extensions.join(',')}
                  />
                  <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange animate-bounce">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag and drop file here, or click to browse</p>
                    <p className="text-[10px] text-slate-400">Supported extensions: {selectedFormat.extensions.join(', ')}</p>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <span key={idx} className="flex items-center space-x-1 px-2.5 py-1 bg-brand-orange/10 rounded-full text-[10px] font-bold text-brand-orange">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{file.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Generate trigger action */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">Diagram outputs will compile locally. Zero telemetry metadata collected.</p>
        <button
          onClick={handleGenerate}
          className="px-6 py-3.5 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl shadow-lg shadow-brand-orange/15 hover:shadow-brand-orange/25 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all flex items-center space-x-2 cursor-pointer"
        >
          <span>Generate Diagram</span>
          <Cpu className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ToolPage;
