import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Heart, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { toolsConfig } from '../config/tools';
import { MiniPreview } from '../components/diagram/MiniPreviews';
import { WatchAiBuild } from '../components/landing/WatchAiBuild';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, pageTransition } from '../utils/animations';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tools');

  const categories = ['All Tools', 'Architecture', 'Database', 'UML', 'Flow', 'Mind Maps', 'Cloud'];

  const filteredTools = useMemo(() => {
    return toolsConfig.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All Tools' || 
        tool.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Flow' && tool.category === 'Flow') ||
        (selectedCategory === 'Mind Maps' && tool.category === 'Mind Maps');

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-24"
    >
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-12 space-y-6">
        <motion.h1 
          variants={fadeUp}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-navy dark:text-white lg:whitespace-nowrap"
        >
          Create <span className="text-brand-orange bg-clip-text">any</span> diagram in seconds.
        </motion.h1>
        <motion.p 
          variants={fadeUp}
          className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Transform text, code, SQL, docs, or descriptions into professional diagrams instantly.
        </motion.p>
      </section>

      {/* Tools Catalog Shell */}
      <section className="space-y-8">
        {/* Search and Category filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-effect shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {/* Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-[1.02]'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <motion.div 
          variants={staggerContainer()}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTools.map((tool) => (
            <motion.div
              variants={fadeUp}
              key={tool.id}
              onClick={() => navigate(`/tools/${tool.id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200/60 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.08)] hover:border-brand-orange/30 hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[300px]"
            >
              <div className="space-y-4">
                {/* Visual Preview */}
                <MiniPreview type={tool.parserType} />

                {/* Info */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{tool.category}</span>
                  <h3 className="text-md font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900 mt-4">
                <div className="flex items-center space-x-1.5">
                  {tool.supportedInputs.slice(0, 3).map((ext) => (
                    <span key={ext} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                      {ext}
                    </span>
                  ))}
                </div>
                <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 glass-effect rounded-2xl">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No tools found matching your request.</p>
          </div>
        )}
      </section>

      {/* Immersive Watch AI Build Section */}
      <WatchAiBuild />

      {/* Why Diagram Genie (Why I Heart Diagram) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy dark:text-white">Why I <Heart className="w-6 h-6 inline-block text-brand-orange fill-brand-orange" /> Diagram</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Building software diagrams shouldn't feel like drawing pixels by hand. Diagram Genie decouples structure from visual style, allowing developers and architects to generate, lay out, and configure diagrams in seconds using simple rule formats.
          </p>
          <div className="space-y-3.5">
            {[
              'Zero configuration or sign-ups required to get started.',
              '100% privacy-first: all parsing runs client-side inside sandbox.',
              'Clean outputs compatible with Mermaid, PlantUML, and JSON configurations.',
              'Supports drag-and-drop of text, SQL, Markdown, or code files.'
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Example Preview Box */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden group min-h-[380px]">
          <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/30 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Example: System Mapping</span>
            </div>

            {/* Interactive Node Layout mockup */}
            <div className="h-44 relative flex items-center justify-center">
              <div className="absolute top-4 left-10 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center w-24">
                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">Customers</p>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange absolute bottom-[-4px] left-1/2 -translate-x-1/2" />
              </div>

              {/* Connecting line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                <path d="M 90 28 L 195 28" className="stroke-slate-300 dark:stroke-slate-700 stroke-1" strokeDasharray="3,3" />
                <path d="M 90 28 Q 140 100 240 100" className="stroke-brand-orange/60 stroke-1.5" />
                <circle cx="140" cy="81" r="2.5" className="fill-brand-orange animate-ping" />
              </svg>

              <div className="absolute top-4 right-10 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center w-24">
                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">Products</p>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange absolute bottom-[-4px] left-1/2 -translate-x-1/2" />
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center w-36">
                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">Relationship Mapping</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/30 pt-4 relative z-10">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Generate diagrams in less than 3 seconds.</span>
            <Link to="/tools" className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center space-x-1">
              <span>Try standard generators</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;
