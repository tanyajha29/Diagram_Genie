import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [reconnected, setReconnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleReconnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setReconnected(true);
      setConnecting(false);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 2000);
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[70vh] flex flex-col items-center justify-center space-y-10 py-12 relative"
    >
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />

      {/* Title */}
      <div className="text-center space-y-2 relative z-10">
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-full">
          Connection Interrupted
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy dark:text-white">
          404: Node Unreachable
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The requested system node could not be resolved in the current architecture map.
        </p>
      </div>

      {/* Animated Broken Diagram Canvas */}
      <div className="w-full max-w-lg h-56 rounded-2xl glass-effect border border-slate-200/50 dark:border-slate-800/50 p-6 relative flex items-center justify-center shadow-md overflow-hidden z-10">
        
        {/* Node 1: Start (Current User Location) */}
        <div className="absolute left-10 p-3 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20 text-center w-28">
          <p className="text-[10px] font-bold">Lost Node</p>
          <p className="text-[8px] opacity-80 mt-0.5">status: 404</p>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/30 absolute right-[-5px] top-1/2 -translate-y-1/2" />
        </div>

        {/* Node 2: Target (Home Node) */}
        <div className={`absolute right-10 p-3 rounded-xl text-center w-28 transition-all duration-500 ${
          reconnected 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
        }`}>
          <p className="text-[10px] font-bold">Gateway Node</p>
          <p className="text-[8px] opacity-80 mt-0.5">{reconnected ? 'connected' : 'offline'}</p>
          <div className={`w-2.5 h-2.5 rounded-full absolute left-[-5px] top-1/2 -translate-y-1/2 transition-colors duration-500 ${
            reconnected ? 'bg-emerald-500 ring-4 ring-emerald-500/30' : 'bg-slate-400 dark:bg-slate-600'
          }`} />
        </div>

        {/* Connective Link Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
          <AnimatePresence>
            {!reconnected && (
              <motion.path 
                key="broken-path"
                d="M 152 112 Q 220 160 278 112" 
                className="stroke-red-400 stroke-2" 
                strokeDasharray="4,4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            
            {connecting && (
              <motion.path 
                key="connecting-path"
                d="M 152 112 L 278 112" 
                className="stroke-amber-400 stroke-2"
                strokeDasharray="5"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
              />
            )}

            {reconnected && (
              <motion.path 
                key="connected-path"
                d="M 152 112 L 278 112" 
                className="stroke-emerald-500 stroke-2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </AnimatePresence>
        </svg>

        {/* Floating alerts */}
        <div className="absolute top-4 flex items-center space-x-1 text-[9px] font-bold text-slate-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interactive Canvas Mapping</span>
        </div>
      </div>

      {/* Recover buttons */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        <button
          onClick={handleReconnect}
          disabled={connecting || reconnected}
          className={`px-6 py-3 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shadow-md ${
            reconnected 
              ? 'bg-emerald-500 text-white cursor-default' 
              : 'bg-brand-orange hover:bg-brand-orange-hover text-white'
          }`}
        >
          {connecting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Resolving routing...</span>
            </>
          ) : reconnected ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Nodes linked! Redirecting...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Reconnect Nodes</span>
            </>
          )}
        </button>

        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-bold text-slate-500 hover:text-brand-orange transition-colors"
        >
          Or force redirect back to home node
        </button>
      </div>
    </motion.div>
  );
};

export default NotFound;
