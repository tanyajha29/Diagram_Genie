import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDiagramStore, type SavedDiagram } from '../store/diagramStore';
import { Key, Star, Clock, Plus, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, generateApiKey, deleteApiKey } = useAuthStore();
  const { savedDiagrams, loadDiagram, deleteSaved, toggleFavorite } = useDiagramStore();

  const handleOpenDiagram = (diag: SavedDiagram) => {
    loadDiagram(diag);
    navigate('/editor');
  };

  // If user is guest or not logged in, prompt login
  if (!user) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-md mx-auto text-center py-12 space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-brand-navy dark:text-white">Guest Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access persistent history saving, API tokens, settings syncing, and team collaboration features.
          </p>
        </div>
        <Link 
          to="/login"
          className="inline-block px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          Sign In / Create Account
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-10 py-6"
    >
      {/* Profile Header Card */}
      <div className="rounded-2xl glass-effect p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
        <div className="flex items-center space-x-4">
          <img src={user.avatarUrl} alt={user.username} className="w-16 h-16 rounded-full ring-2 ring-brand-orange/40" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-brand-navy dark:text-white">{user.username}</h2>
              <span className="text-[10px] font-bold text-white bg-brand-orange px-2 py-0.5 rounded-full">{user.tier}</span>
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-center">
          <div className="px-4 py-2 border-r border-slate-100 dark:border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Saved Diagrams</p>
            <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">{savedDiagrams.length}</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Compiler Runs</p>
            <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">{user.usageCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent workspaces */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Recent Diagrams</span>
            </h3>
            <button
              onClick={() => navigate('/tools')}
              className="text-xs font-bold text-brand-orange hover:underline flex items-center space-x-1"
            >
              <span>New Diagram</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {savedDiagrams.map((diag) => (
              <div
                key={diag.id}
                className="group rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/30 p-4 flex items-center justify-between hover:border-brand-orange/30 hover:bg-white/70 dark:hover:bg-slate-900/50 transition-all shadow-sm"
              >
                <div 
                  className="flex-grow cursor-pointer space-y-1"
                  onClick={() => handleOpenDiagram(diag)}
                >
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors">
                    {diag.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-lg truncate">{diag.description}</p>
                  <span className="text-[9px] text-slate-400 block mt-1">
                    Last modified {new Date(diag.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={() => toggleFavorite(diag.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-amber-500 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${diag.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteSaved(diag.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {savedDiagrams.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">You don't have any saved diagrams yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: API Tokens & Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl glass-effect p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-brand-orange" />
                <span>API Tokens</span>
              </h3>
              <button 
                onClick={generateApiKey}
                className="text-[10px] font-bold text-brand-orange hover:underline"
              >
                Generate Token
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Use tokens to pipeline database scripts and fetch schemas programmatically via the agy CLI.
            </p>

            <div className="space-y-2">
              {user.apiKeys.map((key) => (
                <div key={key} className="flex items-center justify-between bg-slate-100/60 dark:bg-slate-900/50 px-3 py-2 rounded-xl text-[10px] font-mono text-slate-600 dark:text-slate-300">
                  <span className="truncate max-w-[180px]">{key}</span>
                  <button 
                    onClick={() => deleteApiKey(key)}
                    className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {user.apiKeys.length === 0 && (
                <p className="text-[10px] font-semibold text-slate-400 text-center py-3">No API tokens configured.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
