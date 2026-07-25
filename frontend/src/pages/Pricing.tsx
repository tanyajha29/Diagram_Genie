import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free tier',
      price: '$0',
      period: 'forever',
      desc: 'Essential client-side compiling tools for individual developers.',
      features: [
        'Local browser compilation (100% private)',
        'Standard flowchart & mindmap parser engines',
        'Standard resolution PNG/SVG exports',
        'Zustand undo/redo canvas history'
      ],
      cta: 'Start compiling',
      popular: false
    },
    {
      name: 'Genie Pro',
      price: '$12',
      period: 'per month',
      desc: 'Advanced tools, high-res vector output, and sync capabilities.',
      features: [
        'Everything in Free tier',
        'Unlimited high-resolution PNG & SVG exports',
        'Database ER layouts (SQL & Prisma schemas)',
        'Custom developer API token configurations',
        'Secure backup clouds & local storage histories'
      ],
      cta: 'Go Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$39',
      period: 'per seat / month',
      desc: 'Collaborative real-time diagram architecture maps for squads.',
      features: [
        'Everything in Genie Pro',
        'Real-time collaborative diagram team channels',
        'Direct GitHub Action repository parsing integrations',
        'Custom corporate single sign-on (SSO)',
        'Dedicated SLA email support lines'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-12 py-6"
    >
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-navy dark:text-white">
          Slick plans for teams & builders
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
          Unlock high-res exports, database parser capabilities, and sync histories. Standard client-side compiling will always remain free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`group rounded-2xl glass-effect p-8 flex flex-col justify-between relative transition-all duration-300 ${
              plan.popular 
                ? 'border-brand-orange ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-slate-900 shadow-xl shadow-brand-orange/5' 
                : 'border-slate-200/50 dark:border-slate-800/50 hover:border-brand-orange/30 shadow-[0_8px_30px_rgb(0,0,0,0.01)]'
            }`}
          >
            {plan.popular && (
              <span className="absolute top-[-12px] left-1/2 -translate-x-1/2 flex items-center space-x-1 text-[9px] font-bold text-white bg-brand-orange px-3 py-1 rounded-full uppercase tracking-wider shadow">
                <Star className="w-3 h-3 fill-current" />
                <span>Recommended</span>
              </span>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-md font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-brand-navy dark:text-white">{plan.price}</span>
                  <span className="text-[10px] text-slate-400">/ {plan.period}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{plan.desc}</p>
              </div>

              <hr className="border-slate-200/50 dark:border-slate-800/50" />

              <ul className="space-y-3">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-300 leading-normal">
                    <Check className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate('/login')}
              className={`mt-8 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                plan.popular
                  ? 'bg-brand-orange text-white hover:bg-brand-orange-hover shadow-lg shadow-brand-orange/15 hover:shadow-brand-orange/25'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand-orange hover:text-white hover:border-brand-orange'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Pricing;
