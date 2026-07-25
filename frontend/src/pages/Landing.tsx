import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { categoriesConfig } from '../config/tools';
import { CategoryPreview } from '../components/diagram/CategoryPreviews';
import { WatchAiBuild } from '../components/landing/WatchAiBuild';
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
      className={`group cursor-pointer rounded-2xl border bg-white/60 dark:bg-slate-900/40 p-6 flex flex-col justify-between min-h-[350px] transition-all duration-300 relative overflow-hidden select-none ${
        isHovered
          ? 'border-brand-orange/40 shadow-[0_12px_40px_rgba(255,107,53,0.12)]'
          : 'border-slate-200/60 dark:border-slate-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.01)]'
      }`}
    >
      {/* Background blueprint grid activation on hover */}
      <div 
        className={`absolute inset-0 blueprint-grid opacity-[0.03] dark:opacity-[0.05] transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-[0.08] dark:opacity-[0.1]' : ''
        }`} 
      />

      <div className="space-y-6 relative z-10">
        {/* Animated preview SVG category showcase */}
        <div className="w-full rounded-xl bg-slate-100/50 dark:bg-slate-950/30 border border-slate-200/40 dark:border-slate-800/30 overflow-hidden flex items-center justify-center p-2 group-hover:border-brand-orange/20 transition-all duration-300">
          <CategoryPreview id={category.id} isHovered={isHovered} />
        </div>

        {/* Info */}
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

      {/* Footer / Badge */}
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

export const Landing: React.FC = () => {
  const navigate = useNavigate();

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

      {/* Explore Diagram Engines */}
      <section className="space-y-12">
        {/* Responsive Categories Grid */}
        <motion.div 
          variants={staggerContainer()}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4"
        >
          {categoriesConfig.map((cat) => (
            <CategoryCard 
              key={cat.id} 
              category={cat} 
              onClick={() => navigate(`/tools/${cat.id}`)} 
            />
          ))}
        </motion.div>
      </section>

      {/* Immersive Watch AI Build Section */}
      <WatchAiBuild />

      {/* Why Diagram Genie (Why I Heart Diagram) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy dark:text-white">Why I <Heart className="w-6 h-6 inline-block text-brand-orange fill-brand-orange animate-pulse-slow" /> Diagram</h2>
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
            <Link to="/tools/software-architecture" className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center space-x-1">
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
