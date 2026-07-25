import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Network, Cloud, Brain, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

// Custom Database Node for ER Diagrams
export const DatabaseNode: React.FC<any> = ({ data, selected }) => {
  const properties = data.properties || {};
  const hasProperties = Object.keys(properties).length > 0;

  return (
    <div className={`w-64 rounded-xl glass-card overflow-hidden transition-all duration-300 ${
      selected 
        ? 'ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-slate-900 shadow-lg shadow-brand-orange/15 border-brand-orange/40' 
        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-brand-orange/30'
    }`}>
      {/* Target handle left */}
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" />

      {/* Header */}
      <div className="flex items-center space-x-2.5 px-4 py-2.5 bg-indigo-500/10 dark:bg-indigo-500/5 border-b border-slate-200/50 dark:border-slate-800/50">
        <Database className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{data.label}</span>
      </div>

      {/* Columns List */}
      {hasProperties ? (
        <div className="p-3 space-y-1 bg-white/40 dark:bg-slate-950/20">
          {Object.entries(properties).map(([name, type]: [any, any]) => (
            <div key={name} className="flex items-center justify-between text-[10px] font-mono leading-normal">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{name}</span>
              <span className="text-slate-400 dark:text-slate-500">{type}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-[10px] text-slate-400 text-center italic">No columns defined.</div>
      )}

      {/* Source handle right */}
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// Custom Architecture Node
export const ArchitectureNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-52 rounded-xl glass-card p-4 transition-all duration-300 ${
      selected 
        ? 'ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-slate-900 shadow-lg shadow-brand-orange/15 border-brand-orange/40' 
        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-brand-orange/30'
    }`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Network className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{data.label}</h4>
          {data.description && <p className="text-[9px] text-slate-400">{data.description}</p>}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// Custom Cloud Node
export const CloudNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-52 rounded-xl glass-card p-4 transition-all duration-300 ${
      selected 
        ? 'ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-slate-900 shadow-lg shadow-brand-orange/15 border-brand-orange/40' 
        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-brand-orange/30'
    }`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
          <Cloud className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{data.label}</h4>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// Custom Decision Node (Flowcharts)
export const DecisionNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-36 h-36 border border-amber-500/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-center p-4 transition-all duration-300 rotate-45 ${
      selected ? 'ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-slate-900 shadow-lg' : 'hover:border-brand-orange/40'
    }`}>
      {/* Handles aligned in diamond directions */}
      <Handle type="target" position={Position.Left} style={{ left: '-5px', top: '50%' }} className="w-2.5 h-2.5 bg-brand-orange" />
      <Handle type="source" position={Position.Bottom} style={{ bottom: '-5px', left: '50%' }} className="w-2.5 h-2.5 bg-brand-orange" />
      <Handle type="source" position={Position.Right} style={{ right: '-5px', top: '50%' }} className="w-2.5 h-2.5 bg-brand-orange" />
      <Handle type="source" position={Position.Top} style={{ top: '-5px', left: '50%' }} className="w-2.5 h-2.5 bg-brand-orange" />

      {/* text is rotated back */}
      <div className="-rotate-45 space-y-1">
        <HelpCircle className="w-4.5 h-4.5 text-amber-500 mx-auto" />
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-normal block">{data.label}</span>
      </div>
    </div>
  );
};

// Custom Sequence Diagram Actor Node
export const SequenceActorNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-40 rounded-xl glass-card py-3 px-4 text-center border-2 border-dashed transition-all ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-300 dark:border-slate-800'
    }`}>
      {/* Top Handle */}
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{data.label}</span>
      {/* Lifeline line that extends downwards */}
      <div className="absolute top-[38px] left-1/2 -translate-x-1/2 w-[1.5px] h-[500px] border-l border-dashed border-slate-300 dark:border-slate-800 pointer-events-none -z-10" />
    </div>
  );
};

// Custom Sequence Diagram Message Node
export const SequenceMessageNode: React.FC<any> = ({ data, selected }) => {
  const isRight = data.direction === 'right';

  return (
    <div className={`w-44 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-between text-[9px] font-bold shadow-sm transition-all ${
      selected ? 'ring-1 ring-brand-orange border-brand-orange' : 'hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      {isRight ? <ArrowRight className="w-3.5 h-3.5 text-brand-orange shrink-0 mr-1" /> : <ArrowLeft className="w-3.5 h-3.5 text-brand-orange shrink-0 mr-1" />}
      <span className="truncate text-slate-600 dark:text-slate-300 font-mono text-center flex-grow">{data.label}</span>
      {data.isReturn && <span className="text-[7px] text-slate-400 font-normal ml-1">return</span>}
    </div>
  );
};

// Custom Mind Map Node
export const MindmapNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2.5 rounded-full glass-card text-center transition-all duration-300 ${
      selected 
        ? 'ring-2 ring-brand-orange shadow-lg border-brand-orange/40' 
        : 'border-pink-500/30 dark:border-pink-500/20 hover:border-pink-500/50'
    }`}>
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-center space-x-2">
        <Brain className="w-3.5 h-3.5 text-pink-500" />
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
};

export const nodeTypes = {
  database: DatabaseNode,
  architecture: ArchitectureNode,
  cloud: CloudNode,
  decision: DecisionNode,
  sequenceActor: SequenceActorNode,
  sequenceMessage: SequenceMessageNode,
  mindmap: MindmapNode,
  default: ArchitectureNode
};
