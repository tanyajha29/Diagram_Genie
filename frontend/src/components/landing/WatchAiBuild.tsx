import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Network, GitBranch, Download, CheckCircle, 
  FileText, Sparkles, Brain, Cpu, Loader2, Code
} from 'lucide-react';

// Decoupled examples configuration
const EXAMPLES = [
  {
    type: 'SQL Schema',
    filename: 'schema.sql',
    code: `CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title TEXT,
  body TEXT
);`,
    nodes: [
      { id: 'n1', label: 'users', type: 'db', fields: ['id: INT', 'email: VARCHAR', 'created_at: TS'], x1: 40, y1: 180, x2: 60, y2: 60 },
      { id: 'n2', label: 'posts', type: 'db', fields: ['id: INT', 'user_id: INT', 'title: TEXT'], x1: 280, y1: 20, x2: 260, y2: 60 }
    ],
    edges: [
      { id: 'e1', from: 'n2', to: 'n1', label: 'user_id -> id' }
    ],
    diagramType: 'Database ER Diagram'
  },
  {
    type: 'Docker Compose',
    filename: 'docker-compose.yml',
    code: `services:
  gateway:
    image: nginx:alpine
    ports: ["80:80"]
  api:
    build: ./api
    environment:
      - DATABASE_URL
  db:
    image: postgres:15`,
    nodes: [
      { id: 'n1', label: 'gateway', type: 'cloud', fields: ['Nginx', 'Port 80'], x1: 30, y1: 20, x2: 40, y2: 120 },
      { id: 'n2', label: 'api-service', type: 'cloud', fields: ['NodeJS', 'Port 3000'], x1: 200, y1: 180, x2: 180, y2: 120 },
      { id: 'n3', label: 'db-postgres', type: 'cloud', fields: ['PostgreSQL', 'Port 5432'], x1: 290, y1: 30, x2: 320, y2: 120 }
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2', label: 'Proxy HTTP' },
      { id: 'e2', from: 'n2', to: 'n3', label: 'TCP Conn' }
    ],
    diagramType: 'Cloud Architecture'
  },
  {
    type: 'Markdown Outline',
    filename: 'mindmap.md',
    code: `# Diagram Genie
- Core Engine
  - Token Compiler
  - Layout Generator
- Client Workspace
  - Canvas
  - Inspector`,
    nodes: [
      { id: 'n1', label: 'Diagram Genie', type: 'mindmap', fields: [], x1: 40, y1: 120, x2: 50, y2: 110 },
      { id: 'n2', label: 'Core Engine', type: 'mindmap', fields: ['Compiler', 'Layout'], x1: 240, y1: 20, x2: 240, y2: 40 },
      { id: 'n3', label: 'Client Workspace', type: 'mindmap', fields: ['Canvas', 'Inspector'], x1: 260, y1: 200, x2: 240, y2: 170 }
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2', label: 'Branch' },
      { id: 'e2', from: 'n1', to: 'n3', label: 'Branch' }
    ],
    diagramType: 'Interactive Mind Map'
  }
];

export const WatchAiBuild: React.FC = () => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [state, setState] = useState<'INPUT' | 'PARSING' | 'AI_UNDERSTANDING' | 'RELATIONSHIP_EXTRACTION' | 'AUTO_LAYOUT' | 'FINAL_DIAGRAM' | 'EXPORT'>('INPUT');
  const [typedText, setTypedText] = useState('');
  const [statusText, setStatusText] = useState('Reading Structure...');

  const currentExample = EXAMPLES[exampleIdx];

  // Pipeline looping timer state machine
  useEffect(() => {
    let timer: number;
    if (state === 'INPUT') {
      let charIdx = 0;
      const targetText = currentExample.code;
      const interval = setInterval(() => {
        setTypedText(targetText.slice(0, charIdx));
        charIdx += 4;
        if (charIdx >= targetText.length) {
          setTypedText(targetText);
          clearInterval(interval);
          timer = window.setTimeout(() => setState('PARSING'), 1200);
        }
      }, 30);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else if (state === 'PARSING') {
      setStatusText('Reading Structure...');
      const t1 = window.setTimeout(() => setStatusText('Parsing Syntax Tokens...'), 800);
      const t2 = window.setTimeout(() => setStatusText('Recognizing Code Entities...'), 1600);
      timer = window.setTimeout(() => {
        setState('AI_UNDERSTANDING');
      }, 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(timer);
      };
    } else if (state === 'AI_UNDERSTANDING') {
      timer = window.setTimeout(() => setState('RELATIONSHIP_EXTRACTION'), 3000);
    } else if (state === 'RELATIONSHIP_EXTRACTION') {
      timer = window.setTimeout(() => setState('AUTO_LAYOUT'), 3000);
    } else if (state === 'AUTO_LAYOUT') {
      timer = window.setTimeout(() => setState('FINAL_DIAGRAM'), 2500);
    } else if (state === 'FINAL_DIAGRAM') {
      timer = window.setTimeout(() => setState('EXPORT'), 4000);
    } else if (state === 'EXPORT') {
      timer = window.setTimeout(() => {
        setExampleIdx((prev) => (prev + 1) % EXAMPLES.length);
        setTypedText('');
        setState('INPUT');
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [state, exampleIdx]);

  // Monaco Syntax Highlighter
  const highlightCode = (text: string) => {
    return text.split('\n').map((line, i) => {
      const html = line
        .replace(/(CREATE TABLE|services|ports|environment|build|image|PRIMARY KEY|REFERENCES|id|email|created_at|posts|user_id|title|body)/g, '<span class="text-[#FF6B35] font-semibold">$1</span>')
        .replace(/(INT|VARCHAR|TIMESTAMP|TEXT|nginx:alpine|postgres:15|alpine|\d+)/g, '<span class="text-blue-500 font-medium">$1</span>');
      return (
        <div key={i} className="flex font-mono text-[10px] sm:text-[11px] leading-relaxed">
          <span className="w-5 text-slate-400 select-none text-right pr-2 text-[9px]">{i + 1}</span>
          <span className="text-slate-700 dark:text-slate-300 flex-grow whitespace-pre" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    });
  };

  return (
    <div className="space-y-16 py-8">
      {/* Title */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center justify-center gap-2.5">
          <Sparkles className="w-7 h-7 text-brand-orange animate-pulse" />
          <span>Watch AI Build Your Diagram</span>
        </h2>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
          See how your input transforms into a professional diagram in just a few seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Animation Canvas area */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 sm:p-8 min-h-[460px] relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
          
          {/* Step Indicators Tracker */}
          <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center max-w-md mx-auto z-10 text-[9px] sm:text-[10px] font-bold text-slate-400">
            {[
              { id: 'INPUT', label: 'Input' },
              { id: 'PARSING', label: 'Parse' },
              { id: 'AI_UNDERSTANDING', label: 'Understand' },
              { id: 'RELATIONSHIP_EXTRACTION', label: 'Extract' },
              { id: 'AUTO_LAYOUT', label: 'Layout' },
              { id: 'FINAL_DIAGRAM', label: 'Diagram' }
            ].map((stepIndicator) => {
              const active = state === stepIndicator.id || 
                (stepIndicator.id === 'FINAL_DIAGRAM' && state === 'EXPORT');
              return (
                <span 
                  key={stepIndicator.id} 
                  className={`transition-colors duration-300 px-1.5 py-0.5 rounded-full ${
                    active ? 'text-brand-orange bg-brand-orange/10' : ''
                  }`}
                >
                  {stepIndicator.label}
                </span>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            
            {/* 1. INPUT CODE WINDOW */}
            {state === 'INPUT' && (
              <motion.div 
                key="input-code"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xl p-4 sm:p-5 text-left font-mono relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <Code className="w-3 h-3 text-brand-orange" />
                    {currentExample.filename}
                  </span>
                </div>
                <div className="h-44 overflow-y-auto pr-2 custom-scrollbar">
                  {highlightCode(typedText)}
                  <span className="inline-block w-1.5 h-3.5 bg-brand-orange animate-pulse ml-0.5" />
                </div>
              </motion.div>
            )}

            {/* 2. PARSING FLOWS */}
            {state === 'PARSING' && (
              <motion.div 
                key="parsing-flow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-8"
              >
                {/* Simulated Floating Particles */}
                <div className="relative w-64 h-32 flex items-center justify-center">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="absolute w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_#FF6B35]"
                      initial={{ 
                        x: Math.random() * 200 - 100, 
                        y: Math.random() * 100 - 50, 
                        opacity: 1, 
                        scale: 1 
                      }}
                      animate={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 0, 
                        scale: 0.3 
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity, 
                        delay: idx * 0.1, 
                        ease: 'easeIn' 
                      }}
                    />
                  ))}
                  <div className="w-16 h-16 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center relative shadow-inner">
                    <Cpu className="w-6 h-6 text-brand-orange animate-spin-slow" />
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />
                    <span>AI Parser Pipeline</span>
                  </div>
                  <motion.p 
                    key={statusText}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-slate-400 font-medium"
                  >
                    {statusText}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* 3. AI NEURAL UNDERSTANDING */}
            {state === 'AI_UNDERSTANDING' && (
              <motion.div 
                key="neural-understanding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-6"
              >
                {/* SVG Neural Connections */}
                <div className="relative w-80 h-52 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 200">
                    {/* Connection paths */}
                    <line x1="60" y1="100" x2="160" y2="50" stroke="rgba(255,107,53,0.15)" strokeWidth="1.5" />
                    <line x1="60" y1="100" x2="160" y2="150" stroke="rgba(255,107,53,0.15)" strokeWidth="1.5" />
                    <line x1="160" y1="50" x2="260" y2="100" stroke="rgba(255,107,53,0.15)" strokeWidth="1.5" />
                    <line x1="160" y1="150" x2="260" y2="100" stroke="rgba(255,107,53,0.15)" strokeWidth="1.5" />
                    <line x1="160" y1="50" x2="160" y2="150" stroke="rgba(255,107,53,0.15)" strokeWidth="1.5" />

                    {/* Sliding Packets */}
                    <motion.circle 
                      r="3.5" 
                      fill="#FF6B35" 
                      animate={{
                        cx: [60, 160, 260, 160, 60],
                        cy: [100, 50, 100, 150, 100]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.circle 
                      r="3" 
                      fill="#FF6B35" 
                      animate={{
                        cx: [60, 160, 160, 260],
                        cy: [100, 150, 50, 100]
                      }}
                      transition={{ duration: 3.5, repeat: Infinity, delay: 1, ease: 'linear' }}
                    />
                  </svg>

                  {/* Neural nodes */}
                  <motion.div 
                    className="absolute left-[44px] top-[84px] w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-md"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Code className="w-3.5 h-3.5 text-slate-400" />
                  </motion.div>

                  <motion.div 
                    className="absolute left-[144px] top-[34px] w-8 h-8 rounded-full bg-slate-900 border-2 border-brand-orange flex items-center justify-center shadow-[0_0_10px_rgba(255,107,53,0.2)]"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  >
                    <Brain className="w-3.5 h-3.5 text-brand-orange" />
                  </motion.div>

                  <motion.div 
                    className="absolute left-[144px] top-[134px] w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-md"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  </motion.div>

                  <motion.div 
                    className="absolute left-[244px] top-[84px] w-8 h-8 rounded-full bg-slate-900 border-2 border-brand-orange flex items-center justify-center shadow-[0_0_10px_rgba(255,107,53,0.2)]"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                  </motion.div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Semantic AI Analysis</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Extracting structural rules & dependency graphs...</span>
                </div>
              </motion.div>
            )}

            {/* 4. RELATIONSHIP EXTRACTION (UNALIGNED) */}
            {state === 'RELATIONSHIP_EXTRACTION' && (
              <motion.div 
                key="relationship-extraction"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-lg h-64 relative flex items-center justify-center"
              >
                {/* SVG connection lines between unaligned nodes */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 220">
                  {currentExample.edges.map((edge) => {
                    const fromNode = currentExample.nodes.find(n => n.id === edge.from);
                    const toNode = currentExample.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <motion.path
                        key={edge.id}
                        d={`M ${fromNode.x1 + 40} ${fromNode.y1 + 35} Q 180 110 ${toNode.x1 + 40} ${toNode.y1 + 35}`}
                        fill="none"
                        stroke="#FF6B35"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                      />
                    );
                  })}
                </svg>

                {/* Nodes rendering at x1, y1 (unaligned) */}
                {currentExample.nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    className="absolute rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 min-w-[100px] text-left shadow-md flex flex-col space-y-1"
                    style={{ left: node.x1, top: node.y1 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                  >
                    <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/80 pb-1">
                      {node.type === 'db' ? (
                        <Database className="w-3.5 h-3.5 text-brand-orange" />
                      ) : node.type === 'cloud' ? (
                        <Network className="w-3.5 h-3.5 text-brand-orange" />
                      ) : (
                        <GitBranch className="w-3.5 h-3.5 text-brand-orange" />
                      )}
                      <span className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{node.label}</span>
                    </div>
                    {node.fields.slice(0, 2).map((f, i) => (
                      <div key={i} className="text-[8px] text-slate-400 font-mono">{f}</div>
                    ))}
                  </motion.div>
                ))}

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-950/40 rounded-full border border-slate-200/40 dark:border-slate-800/40">
                  Entities Discovered ({currentExample.nodes.length})
                </div>
              </motion.div>
            )}

            {/* 5. AUTO LAYOUT IN ACTION */}
            {state === 'AUTO_LAYOUT' && (
              <motion.div 
                key="auto-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-lg h-64 relative flex items-center justify-center"
              >
                {/* SVG lines transitioning coordinates */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 220">
                  {currentExample.edges.map((edge) => {
                    const fromNode = currentExample.nodes.find(n => n.id === edge.from);
                    const toNode = currentExample.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <motion.line
                        key={edge.id}
                        x1={fromNode.x2 + 40}
                        y1={fromNode.y2 + 35}
                        x2={toNode.x2 + 40}
                        y2={toNode.y2 + 35}
                        stroke="#FF6B35"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    );
                  })}
                </svg>

                {/* Nodes sliding into aligned (x2, y2) positions */}
                {currentExample.nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    layoutId={`node-layout-${node.id}`}
                    className="absolute rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3 min-w-[100px] text-left shadow-md flex flex-col space-y-1"
                    initial={{ left: node.x1, top: node.y1 }}
                    animate={{ left: node.x2, top: node.y2 }}
                    transition={{ type: 'spring', stiffness: 60, damping: 14 }}
                  >
                    <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/80 pb-1">
                      {node.type === 'db' ? (
                        <Database className="w-3.5 h-3.5 text-brand-orange" />
                      ) : node.type === 'cloud' ? (
                        <Network className="w-3.5 h-3.5 text-brand-orange" />
                      ) : (
                        <GitBranch className="w-3.5 h-3.5 text-brand-orange" />
                      )}
                      <span className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{node.label}</span>
                    </div>
                    {node.fields.slice(0, 2).map((f, i) => (
                      <div key={i} className="text-[8px] text-slate-400 font-mono">{f}</div>
                    ))}
                  </motion.div>
                ))}

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 text-[9px] font-bold bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3 py-1 rounded-full shadow-lg shadow-brand-orange/5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Applying Intelligent Layout...</span>
                </div>
              </motion.div>
            )}

            {/* 6. FINAL DIAGRAM COMPLETED */}
            {(state === 'FINAL_DIAGRAM' || state === 'EXPORT') && (
              <motion.div 
                key="final-diagram"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg h-64 relative flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
              >
                {/* SVG connection lines in solid orange with glow */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 220">
                  {currentExample.edges.map((edge) => {
                    const fromNode = currentExample.nodes.find(n => n.id === edge.from);
                    const toNode = currentExample.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <motion.line
                        key={edge.id}
                        x1={fromNode.x2 + 40}
                        y1={fromNode.y2 + 35}
                        x2={toNode.x2 + 40}
                        y2={toNode.y2 + 35}
                        stroke="#FF6B35"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1 }}
                      />
                    );
                  })}
                </svg>

                {/* Styled Aligned Nodes */}
                {currentExample.nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    className="absolute rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 min-w-[110px] text-left shadow-lg border-brand-orange/20 flex flex-col space-y-1 relative"
                    style={{ left: node.x2, top: node.y2 }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: Math.random() }}
                  >
                    <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping" />
                    <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                      {node.type === 'db' ? (
                        <Database className="w-3.5 h-3.5 text-brand-orange" />
                      ) : node.type === 'cloud' ? (
                        <Network className="w-3.5 h-3.5 text-brand-orange" />
                      ) : (
                        <GitBranch className="w-3.5 h-3.5 text-brand-orange" />
                      )}
                      <span className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{node.label}</span>
                    </div>
                    {node.fields.map((f, i) => (
                      <div key={i} className="text-[8px] text-slate-400 font-mono flex justify-between">
                        <span>{f.split(':')[0]}</span>
                        <span className="opacity-70">{f.split(':')[1]}</span>
                      </div>
                    ))}
                  </motion.div>
                ))}

                <div className="absolute top-3 left-4 flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{currentExample.diagramType} rendered</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Underneath Action Panel: Export buttons triggers */}
          <div className="absolute bottom-4 left-0 right-0 px-6">
            <AnimatePresence>
              {state === 'EXPORT' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="flex flex-col items-center space-y-3"
                >
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 px-3 py-1 rounded-full shadow-inner">
                    <Download className="w-3 h-3 text-brand-orange" />
                    <span>Compilation success! Ready to download:</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
                    {['SVG', 'PNG', 'PDF', 'Mermaid', 'PlantUML', 'JSON'].map((ext) => (
                      <button
                        key={ext}
                        className="text-[9px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-orange hover:text-brand-orange hover:shadow-[0_0_12px_rgba(255,107,53,0.1)] transition-all px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        {ext}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right: Glass cards display features list */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          
          <div className="rounded-2xl glass-effect p-5 border border-slate-200/50 dark:border-slate-800/50 flex items-start space-x-3 shadow-[0_4px_30px_rgba(0,0,0,0.015)]">
            <div className="p-2.5 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>AI Powered</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Understands code, documentation, APIs and structured text definitions.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-effect p-5 border border-slate-200/50 dark:border-slate-800/50 flex items-start space-x-3 shadow-[0_4px_30px_rgba(0,0,0,0.015)]">
            <div className="p-2.5 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>Privacy First</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Your files are processed securely client-side and are never permanently stored.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-effect p-5 border border-slate-200/50 dark:border-slate-800/50 flex items-start space-x-3 shadow-[0_4px_30px_rgba(0,0,0,0.015)]">
            <div className="p-2.5 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>50+ Supported Inputs</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                README, SQL schemas, Prisma relations, Docker files, OpenAPI specs, Python classes and more.
              </p>
            </div>
          </div>

          <div className="rounded-2xl glass-effect p-5 border border-slate-200/50 dark:border-slate-800/50 flex items-start space-x-3 shadow-[0_4px_30px_rgba(0,0,0,0.015)]">
            <div className="p-2.5 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>Export Anywhere</span>
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Seamlessly download your workspace diagrams as SVG, PNG, PDF, or text configs like Mermaid.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
