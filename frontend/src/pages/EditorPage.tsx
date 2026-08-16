import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  ReactFlowProvider,
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
  Undo2, Redo2, Save, Download, Trash2, Plus, Sparkles, ChevronLeft, ChevronRight, Settings, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditorContent: React.FC = () => {
  const navigate = useNavigate();
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
    // Map active react flow nodes back to basic UDM format to run layout calculation
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
      position: { x: 200, y: 200 },
      data: { 
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        properties: type === 'database' ? { id: 'INT' } : undefined
      }
    };
    addNode(newNode);
    setSelectedNodeId(id);
    setEditLabel(newNode.data.label as string);
  };

  return (
    <div className="w-screen h-screen relative bg-slate-50 dark:bg-[#0B0F19] overflow-hidden flex">
      {/* Sidebar: Project list & back shortcut */}
      <div className={`border-r border-slate-200/50 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 flex flex-col justify-between shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 p-0 border-r-0 overflow-hidden'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/tools')}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Close Editor</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-brand-orange transition-colors"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Diagram</h3>
            <div className="p-3 bg-white/80 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/40 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{title}</h4>
              <p className="text-[9px] text-slate-400 capitalize">Engine: {toolId}</p>
            </div>
          </div>

          {/* Warnings List */}
          {lastDiagnostics?.warnings && lastDiagnostics.warnings.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] space-y-1.5">
              <div className="font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Compiler Warnings</span>
              </div>
              <ul className="list-disc pl-3.5 space-y-1 max-h-24 overflow-y-auto">
                {lastDiagnostics.warnings.map((w: any, idx: number) => (
                  <li key={idx} className="leading-snug">{w.message || w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Collapsible Diagnostics Panel */}
          {lastDiagnostics && (
            <div className="space-y-2">
              <button
                onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
                className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 hover:text-brand-orange transition-colors"
              >
                <span>Pipeline Diagnostics</span>
                <span className="text-[9px] font-mono">{diagnosticsOpen ? '[-]' : '[+]'}</span>
              </button>
              {diagnosticsOpen && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 rounded-xl space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
                  <div className="truncate" title={lastDiagnostics.requestId}>ID: {lastDiagnostics.requestId}</div>
                  <div>Duration: {lastDiagnostics.executionDurationMs}ms</div>
                  <div>Parser: {lastDiagnostics.parserType}</div>
                  <div>Layout: {lastDiagnostics.layoutEngineId}</div>
                  <div>Tool: {lastDiagnostics.toolId}</div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Recent Workspaces</h3>
            <div className="space-y-2 overflow-y-auto max-h-[350px]">
              {savedDiagrams.map((diag) => (
                <div 
                  key={diag.id}
                  className="p-2.5 rounded-lg text-left text-xs hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:text-brand-orange cursor-pointer transition-colors truncate"
                  onClick={() => useDiagramStore.getState().loadDiagram(diag)}
                >
                  {diag.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center space-x-2 text-xs text-slate-500 hover:text-brand-orange transition-colors px-1"
        >
          <Settings className="w-4 h-4" />
          <span>Editor preferences</span>
        </button>
      </div>

      {/* Main Flow Canvas area */}
      <div className="flex-grow h-full relative" onClick={handleCanvasClick}>
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
          <Background color="#cbd5e1" gap={16} size={1} className="dark:opacity-20" />
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

        {/* Toggle Sidebar Button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-20 p-2 rounded-lg glass-effect border border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:text-brand-orange shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Floating Header Toolbar */}
        <div className={`absolute top-4 z-10 flex items-center space-x-2 p-1.5 rounded-xl glass-effect shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ${sidebarOpen ? 'left-4' : 'left-16'}`}>
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
          
          <button
            onClick={handleTriggerAutoLayout}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center space-x-1"
            title="Auto Layout"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold">Auto Layout</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Add node dropdown trigger */}
          <div className="relative group">
            <button
              className="p-2 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-bold">Add Node</span>
            </button>
            <div className="absolute top-full left-0 mt-1 w-40 rounded-xl glass-effect p-1 shadow-lg border border-slate-200/50 dark:border-slate-800/50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-20">
              {['architecture', 'database', 'cloud', 'decision', 'mindmap'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddNewNode(t)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 hover:bg-brand-orange/15 hover:text-brand-orange font-semibold capitalize"
                >
                  {t} Node
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Export & Save Toolbar (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 p-1.5 rounded-xl glass-effect shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={saveCurrent}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-orange hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center space-x-1"
            title="Save Project"
          >
            <Save className="w-4 h-4" />
            <span className="text-[10px] font-bold">Save</span>
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="p-2 rounded-lg text-white bg-brand-orange hover:bg-brand-orange-hover rounded-lg shadow-sm transition-all flex items-center space-x-1"
            title="Export Diagram"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-bold">Export</span>
          </button>
        </div>

        {/* Floating Zoom / Controls (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-1 p-1 rounded-lg glass-effect border border-slate-200/40 dark:border-slate-800/40">
          <Controls showZoom={true} showFitView={true} showInteractive={false} />
        </div>

        {/* Floating Inspector Panel (Right Drawer) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute top-20 right-4 w-72 rounded-2xl glass-effect border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-xl z-10 space-y-5"
              onClick={(e) => e.stopPropagation()} // avoid canvas click deselection
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Properties</span>
                <button 
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Label Field */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Label Title</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={handleUpdateNode}
                  className="w-full text-xs px-3 py-2 border border-slate-200/60 dark:border-slate-800/60 rounded-xl bg-white/50 dark:bg-slate-900/30 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              {/* ER database schema fields */}
              {selectedNode.type === 'database' && (
                <div className="space-y-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Columns Schema</span>
                  
                  {/* List of current fields */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {Object.entries((selectedNode.data?.properties as Record<string, string>) || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/20 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-900 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                        <span>{key}: {val}</span>
                        <button 
                          onClick={() => handleRemoveDbField(key)}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Field Inputs */}
                  <div className="space-y-2 pt-2 border-t border-dashed border-slate-200/40 dark:border-slate-800/40">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="field_name"
                        value={newPropKey}
                        onChange={(e) => setNewPropKey(e.target.value)}
                        className="text-[10px] px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="INT"
                        value={newPropVal}
                        onChange={(e) => setNewPropVal(e.target.value)}
                        className="text-[10px] px-2 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddDbField}
                      className="w-full py-1.5 text-[10px] font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-lg transition-colors flex items-center justify-center space-x-1"
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
