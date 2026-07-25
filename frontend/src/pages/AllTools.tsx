import React, { useState, useMemo } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import { Search, Star, HelpCircle, ArrowRight, LayoutGrid } from 'lucide-react';
import { toolsConfig, categoriesConfig } from '../config/tools';
import { CategoryPreview } from '../components/diagram/CategoryPreviews';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, pageTransition } from '../utils/animations';

const CategoryCard: React.FC<{
  category: typeof categoriesConfig[0];
  onClick: () => void;
}> = ({ category, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.06;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.06;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${-coords.y}deg) rotateY(${coords.x}deg) translateY(${isHovered ? -6 : 0}px)`
      }}
      className={`group cursor-pointer rounded-2xl border bg-white/60 dark:bg-slate-900/40 p-6 flex flex-col justify-between min-h-[340px] transition-all duration-300 relative overflow-hidden select-none ${
        isHovered
          ? 'border-brand-orange/40 shadow-[0_12px_40px_rgba(255,107,53,0.12)]'
          : 'border-slate-200/60 dark:border-slate-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.01)]'
      }`}
    >
      <div 
        className={`absolute inset-0 blueprint-grid opacity-[0.03] dark:opacity-[0.05] transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-[0.08] dark:opacity-[0.1]' : ''
        }`} 
      />

      <div className="space-y-6 relative z-10">
        <div className="w-full rounded-xl bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/30 overflow-hidden flex items-center justify-center p-2 group-hover:border-brand-orange/20 transition-all duration-300">
          <CategoryPreview id={category.id} isHovered={isHovered} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <motion.span 
              animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="text-xl shrink-0"
            >
              {category.icon}
            </motion.span>
            <h3 className="text-md font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors">
              {category.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900/60 mt-4 relative z-10">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
          {category.toolCount} Tools
        </span>
        <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 group-hover:text-brand-orange transition-colors">
          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:mr-1">Explore</span>
          <motion.div
            animate={isHovered ? { x: [0, 4, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const AllTools: React.FC = () => {
  const navigate = useNav();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return toolsConfig.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12 py-6"
    >
      {/* Page Header */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-brand-navy dark:text-white flex items-center space-x-3">
            <LayoutGrid className="w-8 h-8 text-brand-orange" />
            <span>AI Diagram Engines</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
            Browse our specialized workspace categories or search across 60+ automated diagram generators to build infrastructure charts instantly.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-xl relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search across 60+ specialized tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md focus:outline-none focus:border-brand-orange/60 text-slate-800 dark:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
          />
        </div>
      </section>

      {/* Grid Display: Categories or Search Results */}
      <section className="space-y-8">
        {!searchQuery.trim() ? (
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagram Categories</h2>
            <motion.div 
              variants={staggerContainer()}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {categoriesConfig.map((cat) => (
                <CategoryCard 
                  key={cat.id} 
                  category={cat} 
                  onClick={() => navigate(`/tools/${cat.id}`)} 
                />
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Search Results ({filteredTools.length})
              </h2>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover"
              >
                Clear Search
              </button>
            </div>

            {filteredTools.length > 0 ? (
              <motion.div 
                variants={staggerContainer()}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredTools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    variants={fadeUp}
                    onClick={() => navigate(`/tools/${tool.id}`)}
                    className="group cursor-pointer rounded-2xl border border-slate-200/60 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.08)] hover:border-brand-orange/30 hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-brand-orange">
                          {tool.category}
                        </span>
                        {tool.isPopular && (
                          <span className="flex items-center space-x-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            <Star className="w-2.5 h-2.5 fill-amber-500" />
                            <span>Popular</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-sm sm:text-md font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900 mt-4">
                      <div className="flex items-center space-x-1.5">
                        {tool.supportedInputs.slice(0, 3).map((ext) => (
                          <span key={ext} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                            {ext}
                          </span>
                        ))}
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try searching for other terms like 'aws', 'sql', or 'class'.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default AllTools;
