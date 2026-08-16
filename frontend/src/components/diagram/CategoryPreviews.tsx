import React from 'react';
import { motion } from 'framer-motion';

interface PreviewProps {
  isHovered: boolean;
}

// 1. Software Architecture Preview
export const ArchitecturePreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* Grid background */}
      <rect width="200" height="80" fill="transparent" />
      
      {/* Nodes */}
      <motion.rect x="15" y="25" width="30" height="30" rx="6" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <motion.rect x="85" y="25" width="30" height="30" rx="6" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <motion.rect x="155" y="25" width="30" height="30" rx="6" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />

      {/* Connectors */}
      <motion.path 
        d="M 45 40 L 85 40" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        animate={isHovered ? { strokeDashoffset: -20 } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.path 
        d="M 115 40 L 155 40" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        animate={isHovered ? { strokeDashoffset: -20 } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Glowing Pulses */}
      <motion.circle 
        r="3" 
        fill="#FF6B35" 
        animate={{ cx: [45, 85] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle 
        r="3" 
        fill="#FF6B35" 
        animate={{ cx: [115, 155] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.75, ease: 'easeInOut' }}
      />
      
      {/* Labels */}
      <text x="30" y="43" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono font-bold">API</text>
      <text x="100" y="43" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono font-bold">APP</text>
      <text x="170" y="43" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono font-bold">DB</text>
    </svg>
  );
};

// 2. Database Engineering Preview
export const DatabasePreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* Table A */}
      <rect x="20" y="15" width="45" height="50" rx="4" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <line x1="20" y1="28" x2="65" y2="28" strokeWidth="1" className="stroke-slate-700/50" />
      <text x="42" y="23" textAnchor="middle" fontSize="6" className="fill-brand-orange font-bold font-mono">users</text>
      <circle cx="27" cy="38" r="1.5" fill="#FF6B35" />
      <circle cx="27" cy="48" r="1.5" fill="#94a3b8" />
      <text x="34" y="40" fontSize="5" className="fill-slate-400 font-mono">id</text>
      <text x="34" y="50" fontSize="5" className="fill-slate-400 font-mono">name</text>

      {/* Table B */}
      <rect x="135" y="15" width="45" height="50" rx="4" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <line x1="135" y1="28" x2="180" y2="28" strokeWidth="1" className="stroke-slate-700/50" />
      <text x="157" y="23" textAnchor="middle" fontSize="6" className="fill-brand-orange font-bold font-mono">posts</text>
      <circle cx="142" cy="38" r="1.5" fill="#FF6B35" />
      <circle cx="142" cy="48" r="1.5" fill="#FF6B35" className="opacity-80" />
      <text x="149" y="40" fontSize="5" className="fill-slate-400 font-mono">id</text>
      <text x="149" y="50" fontSize="5" className="fill-slate-400 font-mono">usr_id</text>

      {/* Relationship link line */}
      <motion.path 
        d="M 65 38 L 100 38 L 100 50 L 135 50" 
        strokeWidth="1.5"
        animate={isHovered ? { strokeDasharray: ['4 4', '8 8', '4 4'] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.circle 
        cx="65" 
        cy="38" 
        r="2" 
        fill="#FF6B35" 
        animate={isHovered ? { scale: [1, 1.8, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </svg>
  );
};

// 3. UML Diagram Preview
export const UmlPreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* Base Class */}
      <rect x="75" y="10" width="50" height="25" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="100" y="20" textAnchor="middle" fontSize="6" className="fill-slate-300 font-bold font-mono">Base</text>
      <line x1="75" y1="24" x2="125" y2="24" strokeWidth="1" className="stroke-slate-700/50" />
      <text x="80" y="31" fontSize="5" className="fill-slate-500 font-mono">+id: int</text>

      {/* Derived Class */}
      <rect x="75" y="50" width="50" height="22" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="100" y="59" textAnchor="middle" fontSize="6" className="fill-slate-300 font-bold font-mono">Inherit</text>

      {/* Inheritance Arrow */}
      <motion.path 
        d="M 100 50 L 100 42 L 96 42 L 100 35 L 104 42 L 100 42" 
        strokeWidth="1.2"
        fill="transparent"
        animate={isHovered ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  );
};

// 4. Flow & Process Preview
export const FlowPreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* Flow elements */}
      <rect x="20" y="25" width="30" height="25" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="35" y="40" textAnchor="middle" fontSize="6" className="fill-slate-300 font-mono">Start</text>

      {/* Decision Diamond */}
      <path d="M 100 20 L 115 37.5 L 100 55 L 85 37.5 Z" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="100" y="40" textAnchor="middle" fontSize="6" className="fill-slate-300 font-mono">Verify</text>

      <rect x="150" y="25" width="30" height="25" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="165" y="40" textAnchor="middle" fontSize="6" className="fill-slate-300 font-mono">End</text>

      {/* Connector lines */}
      <motion.path 
        d="M 50 37.5 L 85 37.5" 
        strokeWidth="1.5"
        animate={isHovered ? { strokeDasharray: ['4 2', '2 4'] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
      <motion.path 
        d="M 115 37.5 L 150 37.5" 
        strokeWidth="1.5"
        animate={isHovered ? { strokeDasharray: ['4 2', '2 4'] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </svg>
  );
};

// 5. Cloud & DevOps Preview
export const CloudPreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* Cloud boundaries */}
      <motion.path 
        d="M 40 50 A 20 20 0 0 1 60 20 A 25 25 0 0 1 110 15 A 22 22 0 0 1 145 25 A 20 20 0 0 1 160 50 Z" 
        strokeWidth="1.5" 
        strokeDasharray="4 4"
        className="fill-slate-900/20 dark:fill-slate-950/10"
        animate={isHovered ? { strokeDashoffset: [0, 16] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Inner components */}
      <circle cx="75" cy="45" r="8" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <circle cx="125" cy="45" r="8" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <line x1="83" y1="45" x2="117" y2="45" strokeWidth="1.5" />
      <motion.circle 
        cx={isHovered ? 125 : 75}
        cy="45" 
        r="2.5" 
        fill="#FF6B35"
        animate={isHovered ? { cx: [75, 125, 75] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
};

// 6. API & Backend Preview
export const ApiPreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* Client */}
      <rect x="20" y="25" width="25" height="30" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="32" y="42" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">GET</text>

      {/* Gateway */}
      <rect x="85" y="20" width="30" height="40" rx="4" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="100" y="43" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">GATE</text>

      {/* Server */}
      <rect x="155" y="25" width="25" height="30" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="167" y="42" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">SERV</text>

      {/* Connection paths */}
      <path d="M 45 35 L 85 35" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 85 45 L 45 45" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 115 40 L 155 40" strokeWidth="1" strokeDasharray="3 3" />

      {/* Glowing Packets */}
      <motion.circle 
        r="2" 
        fill="#FF6B35" 
        animate={isHovered ? { cx: [45, 85, 155, 85, 45], cy: [35, 35, 40, 45, 45] } : { cx: 45, cy: 35 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
};

// 7. Project Documentation Preview
export const DocPreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* File Page outline */}
      <rect x="25" y="15" width="40" height="50" rx="2" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <line x1="32" y1="25" x2="58" y2="25" strokeWidth="1" />
      <line x1="32" y1="35" x2="58" y2="35" strokeWidth="1" />
      <line x1="32" y1="45" x2="50" y2="45" strokeWidth="1" />

      {/* Text parsing into Nodes */}
      <path d="M 65 40 L 95 40" strokeWidth="1.5" strokeDasharray="3 3" />
      <motion.circle 
        cx="80" 
        cy="40" 
        r="2" 
        fill="#FF6B35"
        animate={isHovered ? { scale: [1, 2, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Parsed Nodes */}
      <circle cx="125" cy="40" r="8" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <circle cx="160" cy="25" r="8" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <circle cx="160" cy="55" r="8" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      
      <line x1="133" y1="36" x2="152" y2="28" strokeWidth="1" />
      <line x1="133" y1="44" x2="152" y2="52" strokeWidth="1" />
    </svg>
  );
};

// 8. AI & Machine Learning Preview
export const AiPreview: React.FC<PreviewProps> = ({ isHovered }) => {
  return (
    <svg className="w-full h-20 text-brand-orange" viewBox="0 0 200 80" fill="none" stroke="currentColor">
      {/* ML Pipeline stages */}
      <rect x="15" y="25" width="25" height="30" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="27" y="42" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">DATA</text>

      <rect x="60" y="25" width="25" height="30" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="72" y="42" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">EMB</text>

      <rect x="105" y="25" width="35" height="30" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="122" y="42" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">VEC_DB</text>

      <rect x="160" y="25" width="25" height="30" rx="3" strokeWidth="1.5" className="fill-slate-900/60 dark:fill-slate-950/40" />
      <text x="172" y="42" textAnchor="middle" fontSize="6" className="fill-slate-400 font-mono">LLM</text>

      {/* Connectors */}
      <path d="M 40 40 L 60 40" strokeWidth="1.2" />
      <path d="M 85 40 L 105 40" strokeWidth="1.2" />
      <path d="M 140 40 L 160 40" strokeWidth="1.2" />

      {/* Glowing ML Data packet flow */}
      <motion.circle 
        r="2" 
        fill="#FF6B35" 
        animate={isHovered ? { cx: [15, 60, 105, 160, 200], opacity: [1, 1, 1, 1, 0] } : { cx: 15, opacity: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// Dispatch switcher helper
interface PreviewSelectorProps {
  id: string;
  isHovered: boolean;
}

export const CategoryPreview: React.FC<PreviewSelectorProps> = ({ id, isHovered }) => {
  switch (id) {
    case 'software-architecture':
      return <ArchitecturePreview isHovered={isHovered} />;
    case 'database-er':
      return <DatabasePreview isHovered={isHovered} />;
    case 'uml':
      return <UmlPreview isHovered={isHovered} />;
    case 'flow-process':
      return <FlowPreview isHovered={isHovered} />;
    case 'cloud-devops':
      return <CloudPreview isHovered={isHovered} />;
    case 'api-backend':
      return <ApiPreview isHovered={isHovered} />;
    case 'project-documentation':
      return <DocPreview isHovered={isHovered} />;
    case 'ai-machine-learning':
      return <AiPreview isHovered={isHovered} />;
    default:
      return null;
  }
};
