import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, ArrowRight, HelpCircle, Star } from 'lucide-react';
import * as Lucide from 'lucide-react';
import { toolsConfig, categoriesConfig } from '../config/tools';
import { pageTransition, fadeUp, staggerContainer } from '../utils/animations';

// Dynamic string to Lucide component mapping
const LucideIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Lucide as any)[name];
  if (!IconComponent) return <HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

interface CategoryPageProps {
  categoryId: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categoryId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Popular' | 'Recent' | 'Beginner' | 'Advanced'>('All');

  // Find category details
  const category = useMemo(() => {
    // Map URL categoryId back to toolsConfig categories
    const normalizedMap: Record<string, string> = {
      'software-architecture': 'Architecture',
      'database-engineering': 'Database',
      'uml': 'UML',
      'flow-process': 'Flow',
      'cloud-devops': 'Cloud',
      'api-backend': 'API & Backend',
      'project-documentation': 'Project Documentation',
      'ai-machine-learning': 'AI & ML'
    };
    const configCategory = normalizedMap[categoryId] || 'Architecture';
    return categoriesConfig.find(c => c.id === categoryId) || {
      id: categoryId,
      name: configCategory,
      icon: '🏗',
      description: 'Generate specialized AI-powered diagrams.',
      toolCount: 8
    };
  }, [categoryId]);

  const categoryNameMapping: Record<string, string> = {
    'software-architecture': 'Architecture',
    'database-engineering': 'Database',
    'uml': 'UML',
    'flow-process': 'Flow',
    'cloud-devops': 'Cloud',
    'api-backend': 'API & Backend',
    'project-documentation': 'Project Documentation',
    'ai-machine-learning': 'AI & ML'
  };

  // Filter tools inside this category
  const filteredTools = useMemo(() => {
    const configCategory = categoryNameMapping[categoryId] || 'Architecture';
    
    return toolsConfig.filter((tool) => {
      // 1. Matches category
      if (tool.category !== configCategory) return false;

      // 2. Matches search
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // 3. Matches filter pill
      if (selectedFilter === 'Popular') return tool.isPopular;
      if (selectedFilter === 'Recent') return tool.isRecent;
      if (selectedFilter === 'Beginner') return tool.level === 'Beginner';
      if (selectedFilter === 'Advanced') return tool.level === 'Advanced';
      
      return true;
    });
  }, [categoryId, searchQuery, selectedFilter]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12 py-6"
    >
      {/* Back button */}
      <div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </button>
      </div>

      {/* Category Hero */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            <span className="text-2xl sm:text-3.5xl p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 select-none shadow-sm">{category.icon}</span>
            <span>{category.name} Tools</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Generate professional {category.name.toLowerCase()} diagrams from README files, project documentation, infrastructure files and codebases.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${category.name.toLowerCase()} tools...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md focus:outline-none focus:border-brand-orange/60 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-100 dark:border-slate-900/50 pb-4">
          {(['All', 'Popular', 'Recent', 'Beginner', 'Advanced'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange shadow-sm'
                  : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-orange/20 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {filter === 'Recent' ? 'Recently Added' : filter}
            </button>
          ))}
        </div>
      </section>

      {/* Tool Grid */}
      <section className="space-y-8">
        {filteredTools.length > 0 ? (
          <motion.div 
            variants={staggerContainer()}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                variants={fadeUp}
                onClick={() => navigate(`/tools/${tool.id}`)}
                className="group cursor-pointer rounded-2xl border border-slate-200/60 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.08)] hover:border-brand-orange/30 hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px]"
              >
                <div className="space-y-4">
                  {/* Tool Header Icon + Badges */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange group-hover:scale-105 transition-transform duration-300 shadow-sm shrink-0">
                      <LucideIcon name={tool.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {tool.isPopular && (
                        <span className="flex items-center space-x-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          <Star className="w-2.5 h-2.5 fill-amber-500" />
                          <span>Popular</span>
                        </span>
                      )}
                      {tool.isRecent && (
                        <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
                          New
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {tool.level}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-md font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors flex items-center justify-between">
                      <span>{tool.name}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Inputs chips */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {tool.supportedInputs.slice(0, 3).map((ext) => (
                      <span key={ext} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-500 dark:text-slate-400">
                        {ext}
                      </span>
                    ))}
                    {tool.supportedInputs.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        +{tool.supportedInputs.length - 3} more
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-brand-orange transition-colors">
                    Explore
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No tools found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting your search query or choosing another filter.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
};
