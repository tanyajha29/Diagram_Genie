import React, { useState } from 'react';
import { BookOpen, FileText, Code2, Layers, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const Docs: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const docMenu = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'rules-syntax', label: 'Rules & Syntax', icon: Code2 },
    { id: 'supported-imports', label: 'Supported Imports', icon: FileText },
    { id: 'how-engine-works', label: 'Layout Pipeline', icon: Layers }
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6"
    >
      {/* Sidebar navigation */}
      <aside className="lg:col-span-3 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-4">Documentation</h3>
        <div className="flex flex-col space-y-1">
          {docMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                activeSection === item.id
                  ? 'bg-slate-100/80 dark:bg-slate-800/40 text-brand-orange shadow-sm'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Doc text */}
      <div className="lg:col-span-9 rounded-2xl glass-effect p-8 shadow-sm space-y-8 min-h-[500px]">
        {activeSection === 'getting-started' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white">Getting Started</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Welcome to the Diagram Genie developer documentation. Diagram Genie parses text descriptions, code schemas, SQL scripts, and formats them into layered, interactive node-link diagrams.
            </p>
            <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/30 flex items-start space-x-3">
              <Cpu className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">100% Offline & Private</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  All rendering, layout math, and parsing code executes inside your web browser sandbox. No diagram configuration or code is ever uploaded to external servers.
                </p>
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pt-2">Quick Walkthrough</h3>
            <ol className="list-decimal pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
              <li>Select a diagram format from the catalog (e.g., <strong>ER Diagram</strong>).</li>
              <li>Paste schema script or drag and drop a SQL/Prisma file into the editor.</li>
              <li>Click <strong>Generate Diagram</strong>. The system will auto-layout entities and display a React Flow canvas.</li>
              <li>Tweak node labels, double-click fields, or export in SVG/PNG format.</li>
            </ol>
          </div>
        )}

        {activeSection === 'rules-syntax' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white">Rules & Syntax</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Diagram Genie implements a simplified layout syntax. You can outline relations manually using connectors or standard indentation schemas.
            </p>
            
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">1. Flowchart & Architecture Rules</h3>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-300">
{`NodeA -> NodeB : Text description on line
NodeB -> NodeC
NodeC {Is choice?}
NodeC -> [Yes] -> SuccessNode
NodeC -> [No] -> FailureNode`}
              </pre>
            </div>

            <h3 className="text-sm font-bold text-slate-800 dark:text-white pt-2">2. Database Schema Rules</h3>
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-300">
{`Table Users {
  id int pk
  name varchar
  email varchar
}

Table Orders {
  id int pk
  userId int ref: > Users.id
}`}
              </pre>
            </div>
          </div>
        )}

        {activeSection === 'supported-imports' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white">Supported Imports</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our parser selector pipeline parses various file formats automatically based on file extensions or raw contents.
            </p>
            <table className="w-full text-xs text-slate-600 dark:text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Extension</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Target Diagram</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">Behavior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr>
                  <td className="py-3 font-semibold font-mono text-brand-orange">.sql</td>
                  <td className="py-3">ER Diagram</td>
                  <td className="py-3 text-[11px] text-slate-500">Extracts \`CREATE TABLE\` constraints & foreign keys.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold font-mono text-brand-orange">.prisma</td>
                  <td className="py-3">ER Diagram</td>
                  <td className="py-3 text-[11px] text-slate-500">Extracts \`model\` attributes and structural relations.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold font-mono text-brand-orange">.md / .txt</td>
                  <td className="py-3">Mindmap / Flowchart</td>
                  <td className="py-3 text-[11px] text-slate-500">Maps bullet lists hierarchically into tree nodes.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold font-mono text-brand-orange">Docker Compose</td>
                  <td className="py-3">Architecture</td>
                  <td className="py-3 text-[11px] text-slate-500">Converts container services and networking connections.</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeSection === 'how-engine-works' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white">Auto Layout Pipeline</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              To achieve premium node layout alignment, Diagram Genie implements a custom, client-side layered layout logic. The pipeline translates data as follows:
            </p>
            <div className="space-y-2 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">1</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Tokens & AST</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Regex tokens extract entities, parameters, and relationships into an Abstract Syntax Tree.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">2</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">UDM Generation</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">The AST compiles into the Universal Diagram Model consisting of decoupled nodes and edges.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">3</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Coordinate Layering</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">A custom layered layout assigns (x, y) coordinates ensuring clean branching lines and minimal node overlap.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Docs;
