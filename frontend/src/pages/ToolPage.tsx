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
  const [isGenerating, setIsGenerating] = useState(false);
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
    if (pid.includes('readme') || pid.includes('mindmap') || pid.includes('wiki') || diagNameMatches(pid, ['changelog', 'feature', 'story', 'onboarding', 'tech-doc'])) return 'markdown-outline';
    if (pid.includes('ml-') || pid.includes('rag') || pid.includes('llm') || pid.includes('vector') || pid.includes('neural') || pid.includes('prompt') || pid.includes('inference') || pid.includes('ingestion')) return 'pipeline-dsl';

    return '';
  };

  const diagNameMatches = (val: string, list: string[]): boolean => {
    return list.some(item => val.includes(item));
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
    setIsGenerating(true);
    const presetName = selectedPreset?.name || engine.name;
    
    let parserType = selectedFormat.parser;
    if (parserType === 'sql' || parserType === 'prisma') parserType = 'er';
    else if (parserType === 'uml' || parserType === 'sequence') parserType = 'uml';
    else if (parserType === 'flowchart') parserType = 'flowchart';
    else if (parserType === 'markdown-outline') parserType = 'mindmap';
    else if (parserType === 'cloud' || parserType === 'terraform' || parserType === 'docker-compose') parserType = 'cloud';

    initNewDiagram(engine.id, `${presetName} Workspace`, `Generated from ${selectedFormat.label} schema.`);
    
    setTimeout(() => {
      navigate('/processing', { 
        state: { 
          text: editorText, 
          parserType, 
          toolId: selectedPreset?.id || engine.id,
          formatId: selectedFormat.id
        } 
      });
    }, 450);
  };

  const resetEditorSample = () => {
    if (selectedPreset && selectedPreset.id !== 'custom') {
      setEditorText(selectedPreset.sampleData);
    } else {
      setEditorText(selectedFormat.example);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-6xl mx-auto space-y-6 py-6 px-4"
    >
      {/* 1. Back Breadcrumb */}
      <button
        onClick={() => navigate('/tools')}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-455 hover:text-brand-orange transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to catalog</span>
      </button>

      {/* Workspace Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-navy dark:text-white tracking-tight">
          {engine.name} Workspace
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          {engine.description}
        </p>
      </div>

      {/* 2. TWO-COLUMN GRID WORKSPACE: CONFIGURATION + EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* Left Column: Configuration Panel (30% width: 3 cols out of 10) */}
        <aside className="lg:col-span-3 bg-[#0F1424]/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-5">
          <div>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Configuration</h2>
          </div>

          {/* Section 1 - Input Format */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Input Format</label>
            <div className="relative">
              <select
                value={selectedFormat.id}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-orange hover:border-slate-700 transition-colors shadow-sm cursor-pointer appearance-none"
              >
                {engine.formats.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.label} ({f.extensions.join(', ')})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Section 2 - Preset Template */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Preset Template</label>
            <div className="relative">
              <select
                value={selectedPreset?.id || 'custom'}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-orange hover:border-slate-700 transition-colors shadow-sm cursor-pointer appearance-none"
              >
                {engine.presets.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="custom">Custom (Blank Layout)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Section 3 - Input Source */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Input Source</label>
            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => setActiveTab('paste')}
                className={`w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-slate-800 border-brand-orange/60 text-brand-orange shadow-sm shadow-brand-orange/5'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-brand-orange'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Paste Configuration</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-slate-800 border-brand-orange/60 text-brand-orange shadow-sm shadow-brand-orange/5'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-brand-orange'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Code / Schema</span>
              </button>
            </div>
          </div>

          {/* Section 4 - Quick Actions */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Quick Actions</label>
            <button
              onClick={resetEditorSample}
              className="w-full flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-brand-orange hover:bg-slate-850 transition-all cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-brand-orange/70" />
              <span>Reset Sample</span>
            </button>
          </div>

          {/* Generate Button anchored bottom of config */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !editorText.trim()}
              className="w-full py-3 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-lg shadow-brand-orange/15 hover:shadow-brand-orange/25 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,107,53,0.25)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>Generate Diagram</span>
                  <Cpu className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Right Column: DSL Editor Panel (70% width: 7 cols out of 10) */}
        <main className="lg:col-span-7 bg-[#0F1424]/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col min-h-[480px]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0F1424]/85">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>&gt; {selectedFormat.label} EDITOR</span>
            </span>
            <div className="flex items-center space-x-4 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Local compilation</span>
              <span>•</span>
              <button 
                onClick={resetEditorSample}
                className="text-slate-400 hover:text-brand-orange transition-colors cursor-pointer flex items-center space-x-1"
              >
                <RefreshCcw className="w-3 h-3 text-brand-orange/60" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Editor Tab Content */}
          <div className="flex-grow bg-[#090C15] flex flex-col min-h-[420px] relative justify-center">
            <AnimatePresence mode="wait">
              {activeTab === 'paste' ? (
                <motion.div
                  key="paste-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-grow flex flex-col p-2 bg-[#090C15]"
                >
                  <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-950 flex-grow flex">
                    <Editor
                      height="400px"
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
                        padding: { top: 12, bottom: 12 }
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
                  transition={{ duration: 0.15 }}
                  className="flex-grow p-5 flex flex-col items-center justify-center min-h-[416px]"
                >
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full max-w-xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-200 ${
                      dragActive
                        ? 'border-brand-orange bg-brand-orange/5'
                        : 'border-slate-800 bg-slate-950/20 hover:border-brand-orange/40 hover:bg-slate-950/45'
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
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center space-y-1 px-4">
                      <p className="text-xs font-bold text-slate-350">Drag and drop file here, or click to browse</p>
                      <p className="text-[10px] text-slate-500">Supported extensions: {selectedFormat.extensions.join(', ')}</p>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <span key={idx} className="flex items-center space-x-1 px-2.5 py-1 bg-brand-orange/15 border border-brand-orange/20 rounded-full text-[10px] font-bold text-brand-orange">
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

          {/* Action Generate shortcut button inside editor panel */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#0F1424]/60 gap-4 shrink-0">
            <span className="text-[9px] text-slate-500 font-mono">Zero telemetry metadata collected. Ready to compile locally.</span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !editorText.trim()}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Generate</span>
              <Cpu className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default ToolPage;
