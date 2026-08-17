import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ReactFlow, 
  Background, 
  ReactFlowProvider,
  useReactFlow,
  type Connection, 
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from '../store/diagramStore';
import { nodeTypes } from '../components/diagram/CustomNodes';
import { ExportModal } from '../components/diagram/ExportModal';
import { layoutUniversalDiagram } from '../utils/layouter';

import { 
  Undo2, Redo2, Save, Download, Trash2, Plus, Sparkles, ChevronLeft, Settings, AlertTriangle, PanelLeft, Maximize, Terminal, RefreshCcw, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditorContent: React.FC = () => {
  const navigate = useNavigate();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const {
    title,
    toolId,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    updateNodeLabel,
    addNode,
    deleteNode,
    undo,
    redo,
    past,
    future,
    saveCurrent,
    savedDiagrams,
    lastDiagnostics
  } = useDiagramStore();

  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  
  // Custom edit controls
  const [editLabel, setEditLabel] = useState('');
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropVal, setNewPropVal] = useState('');

  // Find currently selected node details
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        animated: true,
        type: 'smoothstep'
      };
      setEdges([...edges, newEdge]);
    },
    [edges, setEdges]
  );

  const handleNodeClick = (_e: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setEditLabel((node.data?.label as string) || '');
  };

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
  };

  const handleUpdateNode = () => {
    if (!selectedNodeId) return;
    updateNodeLabel(selectedNodeId, editLabel);
  };

  // Database field additions
  const handleAddDbField = () => {
    if (!selectedNodeId || !selectedNode || !newPropKey) return;
    const currentProps = (selectedNode.data?.properties as Record<string, string>) || {};
    const updatedProps = { ...currentProps, [newPropKey]: newPropVal || 'VARCHAR' };
    
    updateNodeLabel(selectedNodeId, selectedNode.data.label as string, updatedProps);
    setNewPropKey('');
    setNewPropVal('');
  };

  const handleRemoveDbField = (keyToRemove: string) => {
    if (!selectedNodeId || !selectedNode) return;
    const currentProps = (selectedNode.data?.properties as Record<string, string>) || {};
    const updatedProps = { ...currentProps };
    delete updatedProps[keyToRemove];
    
    updateNodeLabel(selectedNodeId, selectedNode.data.label as string, updatedProps);
  };

  const handleTriggerAutoLayout = () => {
    const rawNodes = nodes.map(n => ({
      id: n.id,
      label: n.data.label as string,
      type: n.type as any,
      properties: n.data.properties as any,
      columns: n.data.columns as any,
      attributes: n.data.attributes as any,
      methods: n.data.methods as any,
      data: n.data
    }));

    const rawEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label as string,
      animated: e.animated
    }));

    const { nodes: nextNodes, edges: nextEdges } = layoutUniversalDiagram(rawNodes, rawEdges, toolId);
    setNodes(nextNodes);
    setEdges(nextEdges);
  };

  const handleAddNewNode = (type: string) => {
    const id = `node-${Math.random().toString(36).substring(2, 6)}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 250, y: 250 },
      data: { 
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        properties: type === 'database' ? { id: 'INT' } : undefined
      }
    };
    addNode(newNode);
    setSelectedNodeId(id);
    setEditLabel(newNode.data.label as string);
  };

  const totalTables = nodes.filter(n => n.type === 'database' || n.type === 'table').length || nodes.length;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0B0F19] text-slate-200 font-sans antialiased overflow-hidden select-none">
      
      {/* 1. EDITOR TOOLBAR */}
      <header className="h-14 border-b border-slate-800 bg-[#0F1424] flex items-center justify-between px-4 z-20 shrink-0">
        
        {/* Left Section: Close & Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/tools')}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Close Editor</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800" />
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg border border-slate-850 hover:text-brand-orange transition-all duration-200 cursor-pointer ${
              sidebarOpen ? 'bg-slate-800/80 text-brand-orange border-slate-700' : 'bg-slate-900/40 text-slate-400 border-slate-800'
            }`}
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center space-x-1.5 ml-2">
            <span className="text-slate-505 font-bold text-xs">DiagramGenie</span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">2.0</span>
          </div>
        </div>

        {/* Center Section: Floating Editor Toolbar Command Bar */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-full shadow-lg backdrop-blur-md">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1.5 rounded-full text-slate-400 hover:text-brand-orange disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition-all cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded-full text-slate-400 hover:text-brand-orange disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition-all cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          
          <button
            onClick={handleTriggerAutoLayout}
            className="px-3 py-1 rounded-full text-slate-400 hover:text-brand-orange hover:bg-slate-800 transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Auto Layout"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Auto Layout</span>
          </button>

          <button
            onClick={() => fitView({ padding: 50 })}
            className="px-3 py-1 rounded-full text-slate-400 hover:text-brand-orange hover:bg-slate-800 transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Fit View"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Fit View</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Add Node Dropdown */}
          <div className="relative group">
            <button
              className="px-3 py-1 rounded-full text-slate-400 hover:text-brand-orange hover:bg-slate-800 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Add Node</span>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-40 rounded-xl bg-slate-900 border border-slate-800/90 p-1.5 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-155 z-30">
              {['architecture', 'database', 'cloud', 'decision', 'mindmap'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddNewNode(t)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] text-slate-400 hover:bg-brand-orange/10 hover:text-brand-orange font-bold capitalize transition-colors"
                >
                  {t} Node
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Save & Export (Primary CTA) */}
        <div className="flex items-center space-x-2">
          <button
            onClick={saveCurrent}
            className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-850 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer text-xs font-bold"
            title="Save Project"
          >
            <Save className="w-3.5 h-3.5 text-brand-orange" />
            <span>Save</span>
          </button>
          
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-lg shadow-md shadow-brand-orange/10 hover:shadow-brand-orange/20 hover:scale-[1.01] transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Export Diagram"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main editor split area */}
      <div className="flex-grow flex relative min-h-0 w-full">
        
        {/* 2. SIDEBAR */}
        <aside className={`border-r border-slate-800 bg-[#0B0F19] p-4 flex flex-col justify-between shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 p-0 border-r-0 overflow-hidden'}`}>
          <div className="space-y-5 min-h-0 flex flex-col">
            
            {/* Active Workspace Card */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-1">Active Workspace</h3>
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {toolId?.includes('db') || toolId?.includes('er') ? 'Database' : 'Architecture'}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{title}</h4>
                <p className="text-[9px] text-slate-405 flex items-center space-x-1">
                  <Terminal className="w-3 h-3 text-brand-orange/70" />
                  <span className="truncate">Engine: {toolId}</span>
                </p>
              </div>
            </div>

            {/* Diagram Information Metrics */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-1">Diagram Information</h3>
              <div className="p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl space-y-2.5 text-xs text-slate-400">
                <div className="space-y-1.5">
                  <div className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider">Metrics</div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/60" />
                    <span>{totalTables} {toolId?.includes('db') || toolId?.includes('er') ? 'Tables' : 'Nodes'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                    <span>{edges.length} Relationships</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60" />
                    <span>Type: {toolId?.includes('db') || toolId?.includes('er') ? 'Database ER' : 'System Map'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Actions */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-1">Layout Controls</h3>
              <div className="p-2.5 bg-slate-950/25 border border-slate-800/40 rounded-xl space-y-1.5 text-xs text-slate-400">
                <button 
                  onClick={handleTriggerAutoLayout}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50 hover:text-brand-orange transition-colors flex items-center space-x-2 text-[10px] font-bold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                  <span>✦ Auto Layout</span>
                </button>
                <button 
                  onClick={() => fitView({ padding: 50 })}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50 hover:text-brand-orange transition-colors flex items-center space-x-2 text-[10px] font-bold cursor-pointer"
                >
                  <Maximize className="w-3.5 h-3.5 text-brand-orange" />
                  <span>⊞ Fit to View</span>
                </button>
                <button 
                  onClick={() => fitView({ padding: 120 })}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50 hover:text-brand-orange transition-colors flex items-center space-x-2 text-[10px] font-bold cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-brand-orange" />
                  <span>↻ Reset View</span>
                </button>
              </div>
            </div>

            {/* Compiler Warnings */}
            {lastDiagnostics?.warnings && lastDiagnostics.warnings.length > 0 && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-500 dark:text-amber-400 rounded-xl text-[10px] space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Compiler Warnings</span>
                </div>
                <ul className="list-disc pl-3.5 space-y-1 max-h-24 overflow-y-auto font-mono">
                  {lastDiagnostics.warnings.map((w: any, idx: number) => (
                    <li key={idx} className="leading-snug">{w.message || w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pipeline Diagnostics */}
            {lastDiagnostics && (
              <div className="space-y-2">
                <button
                  onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-slate-555 uppercase tracking-widest px-1 hover:text-brand-orange transition-colors cursor-pointer"
                >
                  <span>Pipeline Diagnostics</span>
                  <span className="text-[9px] font-mono">{diagnosticsOpen ? '[-]' : '[+]'}</span>
                </button>
                {diagnosticsOpen && (
                  <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl space-y-1.5 text-[10px] text-slate-400 font-mono leading-relaxed">
                    <div className="truncate" title={lastDiagnostics.requestId}>ID: {lastDiagnostics.requestId}</div>
                    <div>Duration: {lastDiagnostics.executionDurationMs}ms</div>
                    <div>Parser: {lastDiagnostics.parserType}</div>
                    <div>Layout: {lastDiagnostics.layoutEngineId}</div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Workspaces List */}
            <div className="space-y-2 flex-grow min-h-0 flex flex-col justify-end">
              <h3 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest px-1">Recent Workspaces</h3>
              <div className="space-y-1 overflow-y-auto max-h-[120px] pr-1">
                {savedDiagrams.map((diag) => {
                  const isDb = diag.type?.includes('db') || diag.type?.includes('er');
                  return (
                    <div 
                      key={diag.id}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-slate-800/40 bg-slate-950/10 border border-transparent hover:border-slate-800 text-slate-400 hover:text-brand-orange cursor-pointer transition-all duration-150 truncate"
                      onClick={() => useDiagramStore.getState().loadDiagram(diag)}
                    >
                      <span className="shrink-0 text-[10px]">{isDb ? '🗄' : '🏗'}</span>
                      <span className="truncate flex-grow font-medium">{diag.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Settings anchored bottom */}
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2 text-xs text-slate-500 hover:text-brand-orange transition-colors px-1 pt-4 border-t border-slate-850 mt-4 shrink-0 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Editor preferences</span>
          </button>
        </aside>

        {/* 3. DIAGRAM CANVAS AREA */}
        <div className="flex-grow h-full relative bg-[#090C15]" onClick={handleCanvasClick}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background color="#1e293b" gap={16} size={1} className="opacity-40" />
            <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
              <defs>
                <marker id="uml-inheritance" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <polygon points="0,0 10,5 0,10" fill="white" stroke="#64748b" strokeWidth="1.5" />
                </marker>
                <marker id="uml-aggregation" viewBox="0 0 12 10" refX="12" refY="5" markerWidth="10" markerHeight="8" orient="auto-start-reverse">
                  <polygon points="0,5 6,1 12,5 6,9" fill="white" stroke="#64748b" strokeWidth="1.5" />
                </marker>
                <marker id="uml-composition" viewBox="0 0 12 10" refX="12" refY="5" markerWidth="10" markerHeight="8" orient="auto-start-reverse">
                  <polygon points="0,5 6,1 12,5 6,9" fill="#64748b" stroke="#64748b" strokeWidth="1" />
                </marker>
              </defs>
            </svg>
          </ReactFlow>

          {/* Floating Zoom / Controls Panel (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg shadow-xl backdrop-blur-md">
            <button 
              onClick={() => zoomIn()} 
              className="p-1.5 rounded text-slate-400 hover:text-brand-orange hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => zoomOut()} 
              className="p-1.5 rounded text-slate-400 hover:text-brand-orange hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => fitView({ padding: 50 })} 
              className="p-1.5 rounded text-slate-400 hover:text-brand-orange hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fit View"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Inspector Panel (Right Drawer) */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute top-4 right-4 w-72 rounded-2xl bg-slate-900/95 border border-slate-800/80 p-5 shadow-2xl backdrop-blur-md z-10 space-y-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">Node Properties</span>
                  <button 
                    onClick={() => deleteNode(selectedNode.id)}
                    className="p-1.5 rounded-lg text-slate-455 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Label Field */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Label Title</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={handleUpdateNode}
                    className="w-full text-xs px-3 py-2.5 border border-slate-800 rounded-xl bg-slate-950/40 text-slate-200 focus:outline-none focus:border-brand-orange/60"
                  />
                </div>

                {/* ER database schema fields */}
                {(selectedNode.type === 'database' || selectedNode.type === 'table') && (
                  <div className="space-y-4 pt-2 border-t border-slate-850">
                    <span className="text-[9px] font-bold uppercase text-slate-550 tracking-wider">Columns Schema</span>
                    
                    {/* List of current fields */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {Object.entries((selectedNode.data?.properties as Record<string, string>) || {}).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between bg-slate-950/20 px-2.5 py-1.5 rounded-lg border border-slate-800/50 text-[10px] font-mono text-slate-355">
                          <span>{key}: {val}</span>
                          <button 
                            onClick={() => handleRemoveDbField(key)}
                            className="text-slate-500 hover:text-red-500 transition-colors ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Field Inputs */}
                    <div className="space-y-2 pt-2 border-t border-dashed border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="field_name"
                          value={newPropKey}
                          onChange={(e) => setNewPropKey(e.target.value)}
                          className="text-[10px] px-2 py-2 rounded bg-slate-950/40 border border-slate-800 text-slate-300 focus:outline-none focus:border-brand-orange/50"
                        />
                        <input
                          type="text"
                          placeholder="INT"
                          value={newPropVal}
                          onChange={(e) => setNewPropVal(e.target.value)}
                          className="text-[10px] px-2 py-2 rounded bg-slate-950/40 border border-slate-800 text-slate-300 focus:outline-none focus:border-brand-orange/50"
                        />
                      </div>
                      <button
                        onClick={handleAddDbField}
                        className="w-full py-2 text-[10px] font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Column</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. EDITOR STATUS BAR */}
      <footer className="h-7 border-t border-slate-800 bg-[#0F1424] flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono z-20 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-400">Ready</span>
          </span>
          <span>•</span>
          <span>Engine: <span className="text-slate-350 capitalize">{toolId}</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{totalTables} Nodes</span>
          <span>{edges.length} Relationships</span>
        </div>
      </footer>

      {/* Export Modal trigger overlay */}
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </div>
  );
};

export const EditorPage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <EditorContent />
    </ReactFlowProvider>
  );
};

export default EditorPage;
