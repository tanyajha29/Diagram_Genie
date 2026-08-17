import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Network, Cloud, Brain, HelpCircle, ArrowRight, ArrowLeft, Monitor, Cpu, ExternalLink, FileText } from 'lucide-react';
import { getDisplayLabel, getDisplaySubtitle } from '../../utils/labels';

// 1. Custom Database Node for ER Diagrams
// 1. Custom Database Node for ER Diagrams
export const DatabaseNode: React.FC<any> = ({ data, selected }) => {
  const columns = React.useMemo(() => {
    return Array.isArray(data.columns) ? data.columns : [];
  }, [data.columns]);

  const hasColumns = columns.length > 0;
  const widthVal = data.width || 256;

  return (
    <div 
      style={{ width: `${widthVal}px` }}
      className={`bg-white dark:bg-slate-900 border-2 rounded-xl transition-all duration-300 ${
        selected 
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20' 
          : 'border-slate-300 dark:border-slate-800'
      } glass-card`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" />

      {/* Header */}
      <div className="flex items-center space-x-2.5 px-4 py-2.5 bg-indigo-500/10 dark:bg-indigo-500/5 border-b border-slate-200/50 dark:border-slate-800/50 rounded-t-xl">
        <Database className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {getDisplayLabel({ label: data.label, type: 'database' })}
        </span>
      </div>

      {/* Columns List */}
      {hasColumns ? (
        <div className="p-3 space-y-1 bg-white/40 dark:bg-slate-950/20 rounded-b-xl">
          {columns.map((col: any) => {
            const isPk = col.primaryKey || col.isPrimaryKey;
            const isFk = col.foreignKey || col.isForeignKey;
            const isNull = col.nullable;
            const isUniq = col.unique;
            const defVal = col.default;

            return (
              <div key={col.name} className="flex items-center justify-between text-[10px] font-mono leading-normal py-0.5 border-b border-slate-100/10 dark:border-slate-800/10 last:border-0">
                <div className="flex items-center space-x-1.5 min-w-0">
                  {isPk && <span className="text-[8px] bg-amber-500/20 text-amber-600 font-bold px-1 rounded uppercase tracking-wide shrink-0">PK</span>}
                  {isFk && <span className="text-[8px] bg-indigo-500/20 text-indigo-600 font-bold px-1 rounded uppercase tracking-wide shrink-0">FK</span>}
                  {isUniq && <span className="text-[8px] bg-sky-500/20 text-sky-600 font-bold px-1 rounded uppercase tracking-wide shrink-0">UQ</span>}
                  <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">{col.name}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 shrink-0 font-normal">
                  <span>{col.type}</span>
                  {isNull && <span className="text-[8px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">NULL</span>}
                  {defVal !== undefined && <span className="text-[8px] text-slate-500 font-normal italic">={defVal}</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 text-[10px] text-slate-400 text-center italic rounded-b-xl">No columns defined.</div>
      )}

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 2. Custom Architecture Node
export const ArchitectureNode: React.FC<any> = ({ data, selected, type }) => {
  const nodeType = data.type || type || 'service';
  
  let Icon = Network;
  let bgClass = 'bg-blue-500/10 text-blue-500';

  if (nodeType === 'frontend' || nodeType === 'actor') {
    Icon = Monitor;
    bgClass = 'bg-sky-500/10 text-sky-500';
  } else if (nodeType === 'backend' || nodeType === 'service' || nodeType === 'api') {
    Icon = Cpu;
    bgClass = 'bg-emerald-500/10 text-emerald-500';
  } else if (nodeType === 'database' || nodeType === 'storage') {
    Icon = Database;
    bgClass = 'bg-indigo-500/10 text-indigo-500';
  } else if (nodeType === 'queue' || nodeType === 'gateway') {
    Icon = Network;
    bgClass = 'bg-purple-500/10 text-purple-500';
  } else if (nodeType === 'external') {
    Icon = ExternalLink;
    bgClass = 'bg-rose-500/10 text-rose-500';
  }

  const subtitle = getDisplaySubtitle({ label: data.label, type: nodeType });

  return (
    <div className={`w-52 rounded-xl bg-white dark:bg-slate-900 border-2 p-4 transition-all duration-300 ${
      selected 
        ? 'border-brand-orange shadow-md' 
        : 'border-slate-300 dark:border-slate-800'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />

      <div className="flex items-center space-x-2.5">
        <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {getDisplayLabel({ label: data.label, type: nodeType })}
          </h4>
          {data.description ? (
            <p className="text-[9px] text-slate-400 truncate">{data.description}</p>
          ) : subtitle ? (
            <p className="text-[9px] text-slate-400 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 3. Custom Cloud Container/Subnet Node
export const CloudNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-52 rounded-xl bg-white dark:bg-slate-900 border-2 p-4 transition-all duration-300 ${
      selected 
        ? 'border-sky-500 shadow-md' 
        : 'border-slate-300 dark:border-slate-800'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />

      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
          <Cloud className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
            {getDisplayLabel({ label: data.label, type: 'cloud' })}
          </h4>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 4. Custom Flowchart Process Node
export const FlowProcessNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-44 py-3.5 px-4 bg-white dark:bg-slate-900 border-2 rounded-lg flex items-center justify-center text-center transition-all ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-400 dark:border-slate-700'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {getDisplayLabel({ label: data.label, type: 'process' })}
      </span>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 5. Custom Flowchart Decision Node
export const DecisionNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className="relative w-36 h-36 flex items-center justify-center text-center p-6 select-none">
      {/* Rotated background card forming the diamond */}
      <div className={`absolute inset-0 rotate-45 border-2 rounded-xl transition-all duration-300 ${
        selected 
          ? 'border-amber-500 shadow-md bg-white dark:bg-slate-900/90 ring-2 ring-amber-500/20' 
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90'
      } glass-card`} />
      
      {/* Handles aligned with the diamond vertices */}
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" style={{ left: '-5px', zIndex: 10 }} />
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" style={{ bottom: '-5px', zIndex: 10 }} />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" style={{ right: '-5px', zIndex: 10 }} />
      <Handle type="source" position={Position.Top} className="w-2.5 h-2.5 bg-brand-orange border-2 border-white dark:border-slate-950" style={{ top: '-5px', zIndex: 10 }} />

      {/* Content container (unrotated) */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-1 w-full h-full">
        <HelpCircle className="w-4 h-4 text-amber-500" />
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-normal break-words max-w-[85px]">
          {getDisplayLabel({ label: data.label, type: 'decision' })}
        </span>
      </div>
    </div>
  );
};

// 6. Custom Flowchart Terminal Node
export const FlowTerminalNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-36 py-2 px-4 bg-slate-100 dark:bg-slate-800 border-2 rounded-full flex items-center justify-center text-center transition-all ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-500 dark:border-slate-700'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {getDisplayLabel({ label: data.label, type: 'terminal' })}
      </span>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 6a. Custom Flowchart Parallelogram (Input/Output) Node
export const FlowParallelogramNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className="relative w-44 h-[60px] select-none flex items-center justify-center text-center">
      <div 
        className={`absolute inset-0 -skew-x-12 border-2 rounded transition-all duration-300 ${
          selected ? 'border-brand-orange shadow-md bg-white dark:bg-slate-900/90' : 'border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900/90'
        } glass-card`} 
      />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" style={{ left: '-2px' }} />
      <span className="relative z-10 text-xs font-bold text-slate-700 dark:text-slate-200 truncate px-4">
        {getDisplayLabel({ label: data.label, type: 'process' })}
      </span>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" style={{ right: '-2px' }} />
    </div>
  );
};

// 6b. Custom Flowchart Cylinder (Database) Node
export const FlowDatabaseNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className="relative w-36 h-24 select-none">
      <div className={`absolute inset-0 border-2 rounded-t-[18px] rounded-b-[18px] transition-all duration-300 ${
        selected ? 'border-brand-orange shadow-md bg-white dark:bg-slate-900/90' : 'border-slate-400 dark:border-slate-700 bg-white dark:bg-slate-900/90'
      } glass-card`} />
      {/* Top cylinder ellipse */}
      <div className="absolute top-0 left-0 right-0 h-6 border-2 border-slate-400 dark:border-slate-700 rounded-full pointer-events-none" />
      {/* Middle dashed dividers for height indicators */}
      <div className="absolute top-8 left-0 right-0 h-[1px] border-t border-dashed border-slate-400 dark:border-slate-700 pointer-events-none" />
      <div className="absolute top-16 left-0 right-0 h-[1px] border-t border-dashed border-slate-400 dark:border-slate-700 pointer-events-none" />
      
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 pt-4 text-center">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
          {getDisplayLabel({ label: data.label, type: 'database' })}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 6c. Custom Flowchart Document Node
export const FlowDocumentNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-40 h-[72px] bg-white dark:bg-slate-900 border-2 rounded-br-2xl transition-all flex items-center justify-center p-3 select-none ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-400 dark:border-slate-700'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      <div className="flex items-center space-x-1.5 justify-center">
        <FileText className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">
          {getDisplayLabel({ label: data.label, type: 'document' })}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 7. Custom UML Class Node
export const UmlClassNode: React.FC<any> = ({ data, selected }) => {
  const isInterface = data.type === 'interface';
  
  const attributes = React.useMemo(() => {
    if (Array.isArray(data.attributes)) return data.attributes;
    if (data.properties && typeof data.properties === 'object') {
      return Object.entries(data.properties).map(([name, type]) => `+ ${name}: ${type}`);
    }
    return [];
  }, [data.attributes, data.properties]);

  const methods = React.useMemo(() => {
    return Array.isArray(data.methods) ? data.methods : [];
  }, [data.methods]);

  return (
    <div className={`w-56 bg-white dark:bg-slate-900 border-2 font-mono text-[10px] transition-all ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-700 dark:border-slate-500'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange" />

      {/* Class Name Compartment */}
      <div className="p-2 border-b-2 border-slate-700 dark:border-slate-500 text-center font-bold text-slate-800 dark:text-slate-200">
        {isInterface && <div className="text-[8px] font-normal text-slate-400">&lt;&lt;interface&gt;&gt;</div>}
        {getDisplayLabel({ label: data.label, type: data.type })}
      </div>

      {/* Attributes Compartment */}
      <div className="p-2 border-b border-slate-700 dark:border-slate-500 space-y-0.5 text-left text-slate-700 dark:text-slate-300">
        {attributes.map((attr: string) => {
          const displayAttr = attr.match(/^[+\-#~]/) ? attr : `+ ${attr}`;
          return (
            <div key={attr} className="truncate">
              {displayAttr}
            </div>
          );
        })}
        {attributes.length === 0 && <div className="italic text-slate-400 text-[8px]">no attributes</div>}
      </div>

      {/* Methods Compartment */}
      <div className="p-2 text-left space-y-0.5 text-slate-700 dark:text-slate-300">
        {methods.map((m: string) => {
          const displayMethod = m.match(/^[+\-#~]/) ? m : `+ ${m}`;
          return (
            <div key={m} className="truncate">
              {displayMethod}
            </div>
          );
        })}
        {methods.length === 0 && <div className="italic text-slate-400 text-[8px]">no methods</div>}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange" />
    </div>
  );
};

// 8. Custom API Endpoint Node
export const ApiEndpointNode: React.FC<any> = ({ data, selected }) => {
  const method = data.method || 'GET';
  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    PUT: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    DELETE: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  };
  const colorClass = methodColors[method.toUpperCase()] || 'bg-slate-500/10 text-slate-500 border-slate-500/30';

  return (
    <div className={`w-56 rounded-xl bg-white dark:bg-slate-900 border-2 p-3.5 flex items-center space-x-2.5 transition-all ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-300 dark:border-slate-800'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange" />
      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border ${colorClass}`}>{method}</span>
      <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100 font-mono" title={data.label}>
        {getDisplayLabel({ label: data.label, type: 'endpoint' })}
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange" />
    </div>
  );
};

// 9. Custom AI/ML Node
export const AiMlNode: React.FC<any> = ({ data, selected }) => {
  const type = data.type || 'dataset';
  const iconMap: Record<string, any> = {
    dataset: Database,
    transform: Cpu,
    model: Brain,
    evaluation: FileText,
    serving: Cloud,
  };
  const Icon = iconMap[type] || Brain;
  const subtitle = getDisplaySubtitle({ label: data.label, type });

  return (
    <div className={`w-52 rounded-xl bg-white dark:bg-slate-900 border-2 p-4 flex items-center space-x-3 transition-all ${
      selected ? 'border-pink-500 shadow-md' : 'border-slate-300 dark:border-slate-800'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {getDisplayLabel({ label: data.label, type })}
        </h4>
        <p className="text-[8px] text-slate-400 capitalize">{subtitle || type}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-brand-orange border-2 border-white dark:border-slate-950" />
    </div>
  );
};

// 10. Sequence Actors
export const SequenceActorNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`w-40 bg-white dark:bg-slate-900 py-3 px-4 text-center border-2 border-dashed transition-all ${
      selected ? 'border-brand-orange shadow-md' : 'border-slate-300 dark:border-slate-800'
    } glass-card`}>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {getDisplayLabel({ label: data.label })}
      </span>
      <div className="absolute top-[38px] left-1/2 -translate-x-1/2 w-[1.5px] h-[500px] border-l border-dashed border-slate-300 dark:border-slate-800 pointer-events-none -z-10" />
    </div>
  );
};

export const SequenceMessageNode: React.FC<any> = ({ data, selected }) => {
  const isRight = data.direction === 'right';

  return (
    <div className={`w-44 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-between text-[9px] font-bold shadow-sm transition-all ${
      selected ? 'ring-1 ring-brand-orange border-brand-orange' : 'hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      {isRight ? <ArrowRight className="w-3.5 h-3.5 text-brand-orange shrink-0 mr-1" /> : <ArrowLeft className="w-3.5 h-3.5 text-brand-orange shrink-0 mr-1" />}
      <span className="truncate text-slate-600 dark:text-slate-300 font-mono text-center flex-grow">
        {getDisplayLabel({ label: data.label })}
      </span>
      {data.isReturn && <span className="text-[7px] text-slate-400 font-normal ml-1">return</span>}
    </div>
  );
};

// 11. Mindmap Node
export const MindmapNode: React.FC<any> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border-2 text-center transition-all duration-300 ${
      selected 
        ? 'border-pink-500 ring-2 ring-pink-500/20' 
        : 'border-pink-500/30 dark:border-pink-500/20 hover:border-pink-500/50'
    } glass-card`}>
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="flex items-center space-x-2">
        <Brain className="w-3.5 h-3.5 text-pink-500" />
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
          {getDisplayLabel({ label: data.label, type: 'mindmap' })}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
};

// 12. Custom Group / Container Node
export const GroupNode: React.FC<any> = ({ data, width, height }) => {
  const w = width || data.width || 300;
  const h = height || data.height || 200;
  return (
    <div 
      style={{ width: `${w}px`, height: `${h}px` }}
      className="rounded-xl border-1.5 transition-all relative overflow-hidden group-container-node"
    >
      <div className="absolute top-0 left-0 right-0 py-1.5 px-3 border-b text-[10px] font-bold tracking-wide uppercase select-none opacity-85 group-header">
        {data.label}
      </div>
    </div>
  );
};

// Expose unified nodeTypes registry mapped to respective types
export const nodeTypes = {
  group: GroupNode,
  container: GroupNode,
  database: DatabaseNode,
  table: DatabaseNode,
  'database-table': DatabaseNode,
  architecture: ArchitectureNode,
  frontend: ArchitectureNode,
  backend: ArchitectureNode,
  queue: ArchitectureNode,
  external: ArchitectureNode,
  service: ArchitectureNode,
  cloud: CloudNode,
  'cloud-node': CloudNode,
  process: FlowProcessNode,
  decision: DecisionNode,
  terminal: FlowTerminalNode,
  'input-output': FlowParallelogramNode,
  'database-cylinder': FlowDatabaseNode,
  document: FlowDocumentNode,
  class: UmlClassNode,
  interface: UmlClassNode,
  endpoint: ApiEndpointNode,
  dataset: AiMlNode,
  transform: AiMlNode,
  model: AiMlNode,
  evaluation: AiMlNode,
  serving: AiMlNode,
  sequenceActor: SequenceActorNode,
  sequenceMessage: SequenceMessageNode,
  mindmap: MindmapNode,
  actor: ArchitectureNode,
  gateway: ArchitectureNode,
  api: ArchitectureNode,
  storage: ArchitectureNode,
  default: ArchitectureNode
};
