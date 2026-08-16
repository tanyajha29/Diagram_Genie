import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Brain, Network, Database, GitFork, FileCode2, Cloud } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDiagramStore } from '../../store/diagramStore';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalNavbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { backendStatus } = useDiagramStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const navItems = [
    { label: 'Examples', path: '/examples' },
    { label: 'Docs', path: '/docs' },
    { label: 'Pricing', path: '/pricing' }
  ];

  const toolsDropdownItems = [
    { label: 'Architecture Diagram', path: '/tools/architecture-diagram', icon: Network, color: 'text-blue-500' },
    { label: 'ER Relation Mapping', path: '/tools/er-diagram', icon: Database, color: 'text-indigo-500' },
    { label: 'Flowcharts Builder', path: '/tools/flowchart', icon: GitFork, color: 'text-orange-500' },
    { label: 'UML Class Designer', path: '/tools/uml-diagram', icon: FileCode2, color: 'text-violet-500' },
    { label: 'Mind Mapping Tool', path: '/tools/mind-map', icon: Brain, color: 'text-pink-500' },
    { label: 'Cloud Infrastructure', path: '/tools/cloud-architecture', icon: Cloud, color: 'text-sky-500' },
  ];

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled 
          ? 'glass-effect shadow-[0_8px_30px_rgb(0,0,0,0.02)] py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2.5">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-brand-orange/40 shadow-sm shrink-0">
              <svg className="w-5 h-5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L9 9l-6 3 6 3 3 6 3-6 6-3-6-3-3-6Z" fill="currentColor" fillOpacity="0.15" />
                <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                <circle cx="12" cy="21" r="1.5" fill="currentColor" />
                <circle cx="3" cy="12" r="1.5" fill="currentColor" />
                <circle cx="21" cy="12" r="1.5" fill="currentColor" />
                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-30" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-brand-navy dark:text-white">
              Diagram<span className="text-brand-orange">Genie</span>
            </span>
          </Link>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 px-2 py-0.5 rounded-full text-[9px] font-semibold text-slate-500 select-none">
            <span className={`w-1.5 h-1.5 rounded-full ${
              backendStatus === 'connected' 
                ? 'bg-emerald-500 animate-pulse' 
                : backendStatus === 'degraded' 
                  ? 'bg-amber-500 animate-pulse' 
                  : 'bg-rose-500 animate-pulse'
            }`} />
            <span className="capitalize">{backendStatus}</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {/* Tools Dropdown Trigger */}
          <div 
            className="relative"
            onMouseEnter={() => setToolsDropdownOpen(true)}
            onMouseLeave={() => setToolsDropdownOpen(false)}
          >
            <button 
              className="flex items-center space-x-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-orange transition-colors"
              onClick={() => navigate('/tools')}
            >
              <span>All Tools</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {toolsDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-1 w-64 rounded-xl glass-effect p-2 shadow-xl border border-slate-200/50 dark:border-slate-800/50"
                >
                  <div className="grid gap-1">
                    {toolsDropdownItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:text-brand-orange dark:hover:text-brand-orange transition-all group"
                      >
                        <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simple Link Items */}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `relative py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-brand-orange' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-orange'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-orange rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <a 
            href="https://github.com/tanyajha29/Diagram_Genie" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>


          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="flex items-center space-x-2">
                <img 
                  src={user.avatarUrl} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full ring-2 ring-brand-orange/40 hover:ring-brand-orange transition-all"
                />
              </Link>
              <button 
                onClick={logout} 
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-orange transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link 
                to="/login?signup=true" 
                className="text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover px-5 py-2.5 rounded-xl shadow-lg shadow-brand-orange/15 hover:shadow-brand-orange/25 hover:scale-[1.01] transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-b border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              <Link 
                to="/tools" 
                onClick={() => setIsOpen(false)}
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                All Tools
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-slate-200 dark:border-slate-800 my-2" />
              {user ? (
                <div className="space-y-2">
                  <Link 
                    to="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2"
                  >
                    <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.username}</span>
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full text-left text-sm font-semibold text-red-500 py-1"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300 py-2 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/login?signup=true" 
                    onClick={() => setIsOpen(false)}
                    className="text-center text-sm font-semibold text-white bg-brand-orange py-2.5 rounded-xl shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
