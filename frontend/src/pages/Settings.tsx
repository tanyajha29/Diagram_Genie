import React from 'react';
import { Settings as SettingsIcon, Keyboard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const Settings: React.FC = () => {


  const shortcuts = [
    { keys: 'Ctrl + Z', label: 'Undo canvas modification' },
    { keys: 'Ctrl + Y', label: 'Redo canvas modification' },
    { keys: 'Ctrl + +', label: 'Zoom in canvas' },
    { keys: 'Ctrl + -', label: 'Zoom out canvas' },
    { keys: 'Space + Drag', label: 'Pan across canvas' },
    { keys: 'Delete', label: 'Delete selected node' }
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-4xl mx-auto space-y-8 py-6"
    >
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <h1 className="text-3xl font-extrabold text-brand-navy dark:text-white flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-brand-orange" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure layout, workspace, and accessibility rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: General Settings */}
        <div className="md:col-span-7 space-y-6">

          {/* Export Defaults Section */}
          <div className="rounded-2xl glass-effect p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-2.5">
              <Shield className="w-4 h-4 text-brand-orange" />
              <span>Export & Privacy defaults</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Enable high-res exports</span>
                <input type="checkbox" defaultChecked className="accent-brand-orange w-4 h-4" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Encrypt saved diagram backups</span>
                <input type="checkbox" defaultChecked className="accent-brand-orange w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Keyboard Shortcuts */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-2xl glass-effect p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-2.5">
              <Keyboard className="w-4 h-4 text-brand-orange" />
              <span>Keyboard Shortcuts</span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.keys} className="py-2.5 flex items-center justify-between text-[11px] gap-2">
                  <span className="text-slate-500 dark:text-slate-400">{shortcut.label}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px] text-slate-600 dark:text-slate-300 font-bold shrink-0">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
