import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalBackground } from './components/layout/GlobalBackground';
import { GlobalNavbar } from './components/layout/GlobalNavbar';
import { GlobalFooter } from './components/layout/GlobalFooter';
import { AnimatePresence } from 'framer-motion';
import { DiagramService } from './services/diagram.service';
import { useDiagramStore } from './store/diagramStore';

// Lazy load pages for optimized performance
const Landing = lazy(() => import('./pages/Landing'));
const AllTools = lazy(() => import('./pages/AllTools'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const Processing = lazy(() => import('./pages/Processing'));
const Examples = lazy(() => import('./pages/Examples'));
const Docs = lazy(() => import('./pages/Docs'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Pricing = lazy(() => import('./pages/Pricing'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Page loading skeleton matching the premium UI
const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
      <div className="absolute inset-0 border-4 border-t-brand-orange rounded-full animate-spin" />
    </div>
    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4 animate-pulse">Loading workspace...</span>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';
  const { setBackendStatus } = useDiagramStore();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await DiagramService.health();
        if (res.status === 'ok') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('degraded');
        }
      } catch (err) {
        setBackendStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [setBackendStatus]);

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      {/* Dynamic Background Grid */}
      <GlobalBackground />

      {/* Conditionally render header and footer for editor view */}
      {!isEditor && <GlobalNavbar />}

      <main className={`flex-grow ${isEditor ? '' : 'px-6 max-w-7xl mx-auto w-full py-8'}`}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Landing />} />
              <Route path="/tools" element={<AllTools />} />
              <Route path="/tools/:toolId" element={<ToolPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/examples" element={<Examples />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      {!isEditor && <GlobalFooter />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
