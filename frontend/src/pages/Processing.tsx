import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { parseTextToUDM } from '../utils/parser';
import { layoutUniversalDiagram } from '../utils/layouter';
import { useDiagramStore } from '../store/diagramStore';
import { DiagramService } from '../services/diagram.service';
import { Cpu, Terminal, Compass, Layout, Sparkles, Check, AlertTriangle, ArrowLeft } from 'lucide-react';

interface PipelineStep {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export const Processing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setNodes, setEdges, setLastDiagnostics } = useDiagramStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps: PipelineStep[] = [
    { label: 'Uploading', icon: Terminal, desc: 'Sending source code to diagram engine...' },
    { label: 'Detecting File', icon: Compass, desc: 'Analyzing source text patterns and MIME headers...' },
    { label: 'Resolving Tool', icon: Cpu, desc: 'Matching format indicators to diagram tools...' },
    { label: 'Parsing', icon: Sparkles, desc: 'Compiling entities into Universal Diagram Model...' },
    { label: 'Applying Layout', icon: Layout, desc: 'Calculating diagram node layout coordinates...' },
    { label: 'Rendering', icon: Layout, desc: 'Mounting nodes onto infinite React Flow canvas...' },
    { label: 'Completed', icon: Check, desc: 'Workspace diagram compiled successfully.' }
  ];

  useEffect(() => {
    if (!location.state) {
      navigate('/tools');
      return;
    }

    const { text, parserType, toolId } = location.state as { text: string; parserType: string; toolId: string };

    // 1. Start pipeline loading animations
    let stepVal = 0;
    intervalRef.current = setInterval(() => {
      if (stepVal < 5) {
        stepVal++;
        setCurrentStep(stepVal);
      }
    }, 450);

    // 2. Call backend generation pipeline
    const runGeneration = async () => {
      try {
        const res = await DiagramService.generateDiagram({
          source: text,
          sourceType: parserType || toolId,
          options: { toolId }
        });

        if (intervalRef.current) clearInterval(intervalRef.current);

        // Fast-forward rendering animations to Success
        setCurrentStep(5);
        
        // Cache diagrams to Zustand store
        setNodes(res.reactFlow.nodes);
        setEdges(res.reactFlow.edges);
        
        // Cache diagnostics trace for collapsible UI panel
        setLastDiagnostics({
          requestId: res.metadata?.requestId || 'N/A',
          executionDurationMs: res.metadata?.executionDurationMs || 0,
          parserType: res.diagnostics?.parserType || parserType,
          layoutEngineId: res.diagnostics?.layoutEngineId || 'grid',
          toolId: toolId,
          warnings: res.warnings || []
        });

        // Show Completed step before navigating
        setTimeout(() => {
          setCurrentStep(6);
          setTimeout(() => navigate('/editor'), 500);
        }, 300);

      } catch (err: any) {
        console.warn('Backend generation failed. Checking connectivity...', err);
        
        // 3. Offline Fallback Mode
        const isNetworkError = err.message?.includes('Failed to fetch') || 
                               err.message?.includes('timed out') || 
                               err.message?.includes('NetworkError');

        if (isNetworkError) {
          setIsOfflineFallback(true);
          if (intervalRef.current) clearInterval(intervalRef.current);

          // Fast forward to parsing/layout
          setCurrentStep(3);

          setTimeout(() => {
            try {
              // Execute local deterministic client-side fallback parsing
              const { nodes: parsedNodes, edges: parsedEdges } = parseTextToUDM(text, parserType || toolId);
              const { nodes: laidOutNodes, edges: laidOutEdges } = layoutUniversalDiagram(parsedNodes, parsedEdges, parserType || toolId);
              
              setNodes(laidOutNodes);
              setEdges(laidOutEdges);
              
              setLastDiagnostics({
                requestId: 'OFFLINE_FALLBACK_LOCAL',
                executionDurationMs: 0,
                parserType: `${parserType || toolId} (Local fallback)`,
                layoutEngineId: 'grid (Local fallback)',
                toolId: toolId,
                warnings: [{ code: 'OFFLINE', message: 'Running in Offline Fallback Mode. Backend is currently unreachable.' }]
              });

              setCurrentStep(6);
              setTimeout(() => navigate('/editor'), 800);
            } catch (fallbackErr: any) {
              setErrorMessage(`Offline compilation failed: ${fallbackErr.message}`);
            }
          }, 800);
        } else {
          // Actual syntax or validation error from backend
          if (intervalRef.current) clearInterval(intervalRef.current);
          setErrorMessage(err.message || 'An unexpected error occurred during parsing.');
        }
      }
    };

    runGeneration();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.state, navigate, setNodes, setEdges, setLastDiagnostics]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-12 py-12 relative overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

      {errorMessage ? (
        // Error view
        <div className="w-full max-w-md p-6 rounded-2xl glass-effect border border-red-500/20 text-center space-y-5 relative z-10">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Generation Pipeline Error</h3>
            <p className="text-xs text-red-600 dark:text-red-400/90 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-brand-orange text-xs text-slate-600 dark:text-slate-300 rounded-xl mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      ) : (
        // Loading Steps view
        <>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className={`absolute inset-0 border rounded-full animate-ping opacity-60 ${isOfflineFallback ? 'border-amber-500/30' : 'border-brand-orange/30'}`} />
            <div className="absolute inset-2 border border-brand-orange/20 border-dashed rounded-full animate-pulse" />
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center shadow-lg transition-all ${
              isOfflineFallback 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-amber-500/10' 
                : 'bg-brand-orange/15 border-brand-orange/40 text-brand-orange shadow-brand-orange/10'
            }`}>
              <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <div className="w-full max-w-md space-y-5 relative z-10">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-brand-navy dark:text-white flex items-center justify-center space-x-2">
                <span>Diagram Engine Pipeline</span>
                {isOfflineFallback && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full select-none font-bold animate-pulse">
                    Offline Fallback
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {isOfflineFallback 
                  ? 'Backend unreachable. Running local deterministic parser fallback...' 
                  : 'Compiling structural models and routing layouts...'}
              </p>
            </div>

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
                        ? isOfflineFallback
                          ? 'border-amber-500/40 bg-amber-500/5 shadow-[0_4px_20px_rgba(245,158,11,0.05)]'
                          : 'border-brand-orange/40 bg-white/80 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(255,107,53,0.05)]' 
                        : isCompleted
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500/80 dark:bg-emerald-950/10'
                          : 'border-slate-100 dark:border-slate-900/50 bg-transparent opacity-40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive 
                        ? isOfflineFallback 
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-brand-orange text-white animate-pulse'
                        : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="flex-grow space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isActive 
                            ? isOfflineFallback ? 'text-amber-500' : 'text-brand-orange' 
                            : isCompleted ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                        {isActive && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse ${
                            isOfflineFallback 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : 'bg-brand-orange/10 text-brand-orange'
                          }`}>
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
        </>
      )}
    </div>
  );
};

export default Processing;
