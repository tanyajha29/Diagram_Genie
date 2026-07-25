import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Star } from 'lucide-react';
import { toolsConfig } from '../config/tools';
import { MiniPreview } from '../components/diagram/MiniPreviews';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, pageTransition } from '../utils/animations';

export const AllTools: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Architecture',
    'Database',
    'UML',
    'Flow',
    'Mind Maps',
    'Cloud',
  ];

  const filteredTools = useMemo(() => {
    return toolsConfig.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        tool.category.toLowerCase() === selectedCategory.toLowerCase() ||
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
      className="space-y-12 py-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-navy dark:text-white">
          Diagram Genie Generators
        </h1>
        <p className="text-sm md:text-md text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
          Select any diagram format below. Paste syntax, SQL scripts, or drag and drop schemas to compile structural charts instantly.
        </p>
      </div>

      {/* Sticky Categories & Search Bar Container */}
      <div className="sticky top-[68px] z-20 py-4 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Large Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code format, diagram type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
          />
        </div>
      </div>

      {/* Grid of Tools */}
      <motion.div 
        variants={staggerContainer(0.06)}
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

              {/* Tool info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    {tool.category}
                  </span>
                  {tool.id === 'er-diagram' && (
                    <span className="flex items-center space-x-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                      <Star className="w-2.5 h-2.5 fill-amber-500" />
                      <span>Popular</span>
                    </span>
                  )}
                </div>
                <h3 className="text-md font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Supported Input / Output types */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900 mt-4">
              <div className="flex flex-col space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Inputs</span>
                <div className="flex items-center space-x-1">
                  {tool.supportedInputs.slice(0, 3).map((ext) => (
                    <span key={ext} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                      {ext}
                    </span>
                  ))}
                  {tool.supportedInputs.length > 3 && (
                    <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                      +{tool.supportedInputs.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredTools.length === 0 && (
        <div className="text-center py-16 glass-effect rounded-2xl">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            We couldn't find any tool configurations matching your query.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AllTools;
