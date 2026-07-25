import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toolsConfig, type ToolConfig } from '../config/tools';
import { useDiagramStore } from '../store/diagramStore';
import { Upload, ClipboardList, FileText, Cpu, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  
  const { initNewDiagram } = useDiagramStore();
  const [tool, setTool] = useState<ToolConfig | null>(null);
  
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [editorText, setEditorText] = useState('');
  
  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize tool configurations
  useEffect(() => {
    const config = toolsConfig.find((t) => t.id === toolId);
    if (config) {
      setTool(config);
      setEditorText(config.sampleData);
    } else {
      navigate('/tools');
    }
  }, [toolId, navigate]);

  if (!tool) return null;

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
      setUploadedFiles(files);
      // Read the first file text into the editor automatically
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
    // Store text and tool info to pass to the processing page
    initNewDiagram(tool.id, `${tool.name} (Active Workspace)`, `Generated from ${tool.name} parser.`);
    
    // Pass editor state to Processing page via state router redirect
    navigate('/processing', { 
      state: { 
        text: editorText, 
        parserType: tool.parserType,
        toolId: tool.id
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
          {tool.name} Generator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {tool.description}
        </p>
      </div>

      {/* Inputs tabs panel */}
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

        {/* Tab contents */}
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
                {/* Monaco editor toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syntax Editor</span>
                  <button 
                    onClick={() => setEditorText(tool.sampleData)}
                    className="flex items-center space-x-1 text-[9px] font-bold text-slate-500 hover:text-brand-orange transition-colors"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    <span>Reset Sample</span>
                  </button>
                </div>
                
                {/* Monaco Editor frame */}
                <div className="flex-grow min-h-[340px] p-2 bg-slate-900">
                  <Editor
                    height="340px"
                    theme="vs-dark"
                    defaultLanguage="markdown"
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
                    accept={tool.supportedInputs.join(',')}
                  />
                  <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange animate-bounce">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag and drop file here, or click to browse</p>
                    <p className="text-[10px] text-slate-400">Supported extensions: {tool.supportedInputs.join(', ')}</p>
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
