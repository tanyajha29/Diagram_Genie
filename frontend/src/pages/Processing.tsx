import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseTextToUDM } from '../utils/parser';
import { layoutUniversalDiagram } from '../utils/layouter';
import { useDiagramStore } from '../store/diagramStore';
import { Cpu, Terminal, Compass, Layout, Sparkles, Check } from 'lucide-react';

interface PipelineStep {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export const Processing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setNodes, setEdges } = useDiagramStore();

  const [currentStep, setCurrentStep] = useState(0);

  const steps: PipelineStep[] = [
    { label: 'Parsing', icon: Terminal, desc: 'Scanning text tokens and parsing relationships...' },
    { label: 'Understanding', icon: Compass, desc: 'Building semantic definitions and structures...' },
    { label: 'Extracting', icon: Cpu, desc: 'Compiling entities into Universal Diagram Model...' },
    { label: 'Generating', icon: Sparkles, desc: 'Executing layered positioning and routing algorithms...' },
    { label: 'Rendering', icon: Layout, desc: 'Mounting nodes onto infinite React Flow canvas...' }
  ];

  useEffect(() => {
    // If no state is passed, redirect back to catalog
    if (!location.state) {
      navigate('/tools');
      return;
    }

    const { text, parserType } = location.state as { text: string; parserType: string; toolId: string };

    // 1. Run the parser and layouter immediately in the background
    const { nodes: parsedNodes, edges: parsedEdges } = parseTextToUDM(text, parserType);
    const { nodes: laidOutNodes, edges: laidOutEdges } = layoutUniversalDiagram(parsedNodes, parsedEdges, parserType);

    // 2. Animate through the step workflow sequentially
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
      } else {
        clearInterval(interval);
        
        // Save layouts to Zustand store
        setNodes(laidOutNodes);
        setEdges(laidOutEdges);
        
        // Navigate to the editor page
        navigate('/editor');
      }
    }, 600); // 600ms per step

    return () => clearInterval(interval);
  }, [location.state, navigate, setNodes, setEdges]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-12 py-12 relative overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

      {/* Outer Glowing Canvas Pipeline */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Animated blueprint grid circles */}
        <div className="absolute inset-0 border border-brand-orange/30 rounded-full animate-ping opacity-60" />
        <div className="absolute inset-2 border border-brand-orange/20 border-dashed rounded-full animate-pulse" />
        <div className="w-16 h-16 rounded-full bg-brand-orange/15 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-[0_0_30px_rgba(255,107,53,0.25)]">
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      {/* Steps Pipeline View */}
      <div className="w-full max-w-md space-y-5 relative z-10">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-brand-navy dark:text-white">AI Compiling Pipeline</h2>
          <p className="text-xs text-slate-400">Diagram Genie is mapping structural components...</p>
        </div>

        {/* Timeline wrapper */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-4 p-3.5 rounded-xl border transition-all duration-300 ${
                  isActive 
                    ? 'border-brand-orange/40 bg-white/80 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(255,107,53,0.05)]' 
                    : isCompleted
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500/80 dark:bg-emerald-950/10'
                      : 'border-slate-100 dark:border-slate-900/50 bg-transparent opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-brand-orange text-white animate-pulse'
                    : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>

                <div className="flex-grow space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isActive ? 'text-brand-orange' : isCompleted ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Processing;
