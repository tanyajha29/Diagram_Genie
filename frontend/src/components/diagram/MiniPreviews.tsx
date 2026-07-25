import React from 'react';

export const ArchitecturePreview: React.FC = () => (
  <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl overflow-hidden relative">
    <svg className="w-4/5 h-4/5" viewBox="0 0 160 80">
      {/* Node 1 */}
      <rect x="15" y="25" width="30" height="22" rx="4" className="fill-white dark:fill-slate-800 stroke-blue-500/50 stroke-1" />
      <text x="30" y="38" fontSize="6" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Client</text>
      
      {/* Node 2 */}
      <rect x="65" y="25" width="30" height="22" rx="4" className="fill-white dark:fill-slate-800 stroke-brand-orange/50 stroke-1" />
      <text x="80" y="38" fontSize="6" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">API</text>

      {/* Node 3 */}
      <rect x="115" y="25" width="30" height="22" rx="4" className="fill-white dark:fill-slate-800 stroke-emerald-500/50 stroke-1" />
      <text x="130" y="38" fontSize="6" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Database</text>

      {/* Connectors */}
      <path d="M 45 36 L 65 36" fill="none" className="stroke-slate-300 dark:stroke-slate-700 stroke-1" strokeDasharray="3,3" />
      <path d="M 95 36 L 115 36" fill="none" className="stroke-slate-300 dark:stroke-slate-700 stroke-1" strokeDasharray="3,3" />

      {/* Traveling packets */}
      <circle r="2" className="fill-blue-500">
        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 45 36 L 65 36" />
      </circle>
      <circle r="2" className="fill-brand-orange">
        <animateMotion dur="2.5s" begin="1.2s" repeatCount="indefinite" path="M 95 36 L 115 36" />
      </circle>
    </svg>
  </div>
);

export const ERPreview: React.FC = () => (
  <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl overflow-hidden relative">
    <svg className="w-4/5 h-4/5" viewBox="0 0 160 80">
      {/* Table 1 */}
      <rect x="15" y="15" width="35" height="32" rx="4" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <rect x="15" y="15" width="35" height="10" rx="4" className="fill-orange-50 dark:fill-orange-950/20" />
      <text x="32.5" y="22" fontSize="5" textAnchor="middle" className="fill-brand-orange font-bold">Users</text>
      <text x="20" y="33" fontSize="4.5" className="fill-slate-400">id [PK]</text>
      <text x="20" y="41" fontSize="4.5" className="fill-slate-400">name</text>

      {/* Table 2 */}
      <rect x="110" y="15" width="35" height="32" rx="4" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <rect x="110" y="15" width="35" height="10" rx="4" className="fill-indigo-50 dark:fill-indigo-950/20" />
      <text x="127.5" y="22" fontSize="5" textAnchor="middle" className="fill-indigo-500 font-bold">Orders</text>
      <text x="115" y="33" fontSize="4.5" className="fill-slate-400">id [PK]</text>
      <text x="115" y="41" fontSize="4.5" className="fill-slate-400">userId [FK]</text>

      {/* Connection Line */}
      <path d="M 50 33 L 110 41" fill="none" className="stroke-indigo-400/80 dark:stroke-indigo-500/80 stroke-1" strokeDasharray="100" strokeDashoffset="100">
        <animate attributeName="stroke-dashoffset" values="100;0;0;100" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Relational crow's foot indicators */}
      <circle cx="50" cy="33" r="1.5" className="fill-indigo-500" />
      <path d="M 105 38 L 110 41 L 105 44" fill="none" className="stroke-indigo-500 stroke-1" />
    </svg>
  </div>
);

export const FlowchartPreview: React.FC = () => (
  <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl overflow-hidden relative">
    <svg className="w-4/5 h-4/5" viewBox="0 0 160 80">
      {/* Start Node */}
      <rect x="15" y="30" width="22" height="16" rx="8" className="fill-white dark:fill-slate-800 stroke-emerald-500/50 stroke-1" />
      <text x="26" y="40" fontSize="5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Start</text>

      {/* Process Node */}
      <rect x="65" y="30" width="30" height="16" rx="2" className="fill-white dark:fill-slate-800 stroke-blue-500/50 stroke-1" />
      <text x="80" y="40" fontSize="5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Process</text>

      {/* Decision Node */}
      <path d="M 130 22 L 142 38 L 130 54 L 118 38 Z" className="fill-white dark:fill-slate-800 stroke-amber-500/50 stroke-1" />
      <text x="130" y="41" fontSize="4.5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Decision</text>

      {/* Connection paths */}
      <path d="M 37 38 L 65 38" fill="none" className="stroke-slate-300 dark:stroke-slate-700 stroke-1" />
      <path d="M 95 38 L 118 38" fill="none" className="stroke-slate-300 dark:stroke-slate-700 stroke-1" />

      {/* Pulsing indicator along path */}
      <circle r="1.5" className="fill-emerald-500">
        <animateMotion dur="3s" repeatCount="indefinite" path="M 37 38 L 65 38 H 95 L 118 38" />
      </circle>
    </svg>
  </div>
);

export const UMLPreview: React.FC = () => (
  <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl overflow-hidden relative">
    <svg className="w-4/5 h-4/5" viewBox="0 0 160 80">
      {/* Parent Class */}
      <rect x="65" y="10" width="30" height="22" rx="2" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <line x1="65" y1="20" x2="95" y2="20" className="stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <text x="80" y="17" fontSize="5.5" textAnchor="middle" className="fill-violet-500 font-bold">Animal</text>

      {/* Sub Class 1 */}
      <rect x="25" y="48" width="30" height="22" rx="2" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <line x1="25" y1="58" x2="55" y2="58" className="stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <text x="40" y="55" fontSize="5.5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Dog</text>

      {/* Sub Class 2 */}
      <rect x="105" y="48" width="30" height="22" rx="2" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <line x1="105" y1="58" x2="135" y2="58" className="stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <text x="120" y="55" fontSize="5.5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">Cat</text>

      {/* Inherits Connector */}
      <path d="M 40 48 L 40 40 L 80 40 L 80 32" fill="none" className="stroke-violet-400 stroke-1" />
      <path d="M 120 48 L 120 40 L 80 40" fill="none" className="stroke-violet-400 stroke-1" />
      <polygon points="80,32 77,36 83,36" className="fill-white dark:fill-slate-800 stroke-violet-400 stroke-1" />
    </svg>
  </div>
);

export const MindmapPreview: React.FC = () => (
  <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl overflow-hidden relative">
    <svg className="w-4/5 h-4/5" viewBox="0 0 160 80">
      {/* Central Node */}
      <circle cx="80" cy="40" r="10" className="fill-white dark:fill-slate-800 stroke-pink-500/50 stroke-1" />
      <text x="80" y="42" fontSize="5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-semibold">Idea</text>

      {/* Branches */}
      <g>
        <path d="M 70 40 Q 50 30 40 30" fill="none" className="stroke-pink-400 stroke-1" />
        <circle cx="40" cy="30" r="5" className="fill-white dark:fill-slate-800 stroke-pink-400 stroke-1">
          <animate attributeName="r" values="0;5;5;0" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>
      
      <g>
        <path d="M 90 40 Q 110 30 120 30" fill="none" className="stroke-pink-400 stroke-1" />
        <circle cx="120" cy="30" r="5" className="fill-white dark:fill-slate-800 stroke-pink-400 stroke-1">
          <animate attributeName="r" values="0;0;5;5" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>

      <g>
        <path d="M 80 50 Q 80 65 95 65" fill="none" className="stroke-pink-400 stroke-1" />
        <circle cx="95" cy="65" r="5" className="fill-white dark:fill-slate-800 stroke-pink-400 stroke-1">
          <animate attributeName="r" values="0;0;0;5" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
);

export const CloudPreview: React.FC = () => (
  <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 rounded-xl overflow-hidden relative">
    <svg className="w-4/5 h-4/5" viewBox="0 0 160 80">
      {/* Cloud Service */}
      <rect x="65" y="15" width="30" height="20" rx="6" className="fill-white dark:fill-slate-800 stroke-sky-500/50 stroke-1" />
      <text x="80" y="27" fontSize="5" textAnchor="middle" className="fill-sky-500 font-semibold">EC2</text>

      {/* Database */}
      <rect x="25" y="48" width="30" height="20" rx="4" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <text x="40" y="60" fontSize="5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">RDS</text>

      {/* S3 Bucket */}
      <rect x="105" y="48" width="30" height="20" rx="4" className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700 stroke-1" />
      <text x="120" y="60" fontSize="5" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 font-medium">S3 Storage</text>

      {/* Connectors */}
      <path d="M 65 25 L 40 48" fill="none" className="stroke-sky-300/80 stroke-1" strokeDasharray="3,3" />
      <path d="M 95 25 L 120 48" fill="none" className="stroke-sky-300/80 stroke-1" strokeDasharray="3,3" />

      {/* Signal flow */}
      <circle r="1.5" className="fill-sky-400">
        <animateMotion dur="2s" repeatCount="indefinite" path="M 65 25 L 40 48" />
      </circle>
      <circle r="1.5" className="fill-sky-400">
        <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path="M 95 25 L 120 48" />
      </circle>
    </svg>
  </div>
);

interface MiniPreviewProps {
  type: 'architecture' | 'er' | 'flowchart' | 'uml' | 'mindmap' | 'cloud';
}

export const MiniPreview: React.FC<MiniPreviewProps> = ({ type }) => {
  switch (type) {
    case 'architecture':
      return <ArchitecturePreview />;
    case 'er':
      return <ERPreview />;
    case 'flowchart':
      return <FlowchartPreview />;
    case 'uml':
      return <UMLPreview />;
    case 'mindmap':
      return <MindmapPreview />;
    case 'cloud':
      return <CloudPreview />;
    default:
      return null;
  }
};
