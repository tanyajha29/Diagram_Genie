import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Database, Layout, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignUpDefault = searchParams.get('signup') === 'true';

  const { login, loginAsGuest } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address');
      return;
    }
    login(email, username);
    navigate('/profile');
  };

  const handleGuestEntry = () => {
    loginAsGuest();
    navigate('/');
  };

  const benefits = [
    { icon: Layout, title: 'Manage Projects', desc: 'Save multiple diagram workspaces and edit them over time.' },
    { icon: Database, title: 'Export Preferences', desc: 'Remember default format preferences like SVG, PDF, or Mermaid.' },
    { icon: Sparkles, title: 'AI Enhancements', desc: 'Access advanced prompt-to-nodes translation utilities.' },
    { icon: Shield, title: 'Cloud Sync', desc: 'Securely sync and backup configuration charts across your systems.' }
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6"
    >
      {/* Left Column: Animated blueprint illustration */}
      <div className="lg:col-span-6 hidden lg:block space-y-8 p-8 relative min-h-[500px] flex flex-col justify-center">
        <div className="absolute inset-0 blueprint-grid opacity-20 rounded-2xl pointer-events-none" />
        <div className="space-y-4 relative z-10">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-3 py-1.5 rounded-full">
            Developer Account
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-brand-navy dark:text-white leading-tight">
            Design, layout, and document systems like a pro.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md font-normal leading-relaxed">
            Gain full access to recent histories, unlimited export sizes, custom API tokens, and live Mermaid layouts.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="space-y-2 p-4 rounded-xl glass-card">
              <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <benefit.icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">{benefit.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Glass Login card */}
      <div className="lg:col-span-6 flex justify-center">
        <div className="w-full max-w-md rounded-2xl glass-effect p-8 shadow-xl border border-slate-200/50 dark:border-slate-800/50 space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-2xl font-bold text-brand-navy dark:text-white">
              {isSignUp ? 'Create your Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-brand-orange font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Username</label>
                <input
                  type="text"
                  required
                  placeholder="alex_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange transition-all"
              />
            </div>

            {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl shadow-lg shadow-brand-orange/15 hover:shadow-brand-orange/25 transition-all"
            >
              {isSignUp ? 'Create Free Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Continue as Guest Button (Equally prominent) */}
          <button
            onClick={handleGuestEntry}
            className="w-full py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-xl transition-all"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
