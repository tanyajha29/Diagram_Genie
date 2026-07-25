import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const GlobalFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-auto border-t border-slate-100 dark:border-slate-900 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        {/* Left */}
        <div>
          <span>&copy; {currentYear} | </span>
          <Link to="/" className="font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-orange transition-colors">
            Diagram Genie
          </Link>
          <span>. All rights reserved.</span>
        </div>

        {/* Center */}
        <div className="flex items-center space-x-6">
          <Link to="/privacy" className="hover:text-brand-orange transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-brand-orange transition-colors">Terms</Link>
          <a href="https://github.com/tanyajha29/Diagram_Genie" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">Github</a>
          <Link to="/docs" className="hover:text-brand-orange transition-colors">API</Link>
          <Link to="/contact" className="hover:text-brand-orange transition-colors">Contact</Link>
          <Link to="/status" className="hover:text-brand-orange transition-colors flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Systems Normal</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-1">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-brand-orange fill-brand-orange" />
          <span>for builders & creators</span>
        </div>
      </div>
    </footer>
  );
};
