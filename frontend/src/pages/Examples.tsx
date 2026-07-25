import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Database, Cloud, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDiagramStore, type SavedDiagram } from '../store/diagramStore';
import { pageTransition } from '../utils/animations';

export const Examples: React.FC = () => {
  const navigate = useNavigate();
  const { loadDiagram } = useDiagramStore();

  const sampleTemplates: SavedDiagram[] = [
    {
      id: 'template-er',
      title: 'E-Commerce Database Schema',
      description: 'Standard relational schema representing users, orders, items, and billing details.',
      type: 'er',
      nodes: [
        { id: '1', type: 'database', position: { x: 50, y: 50 }, data: { label: 'Users', properties: { id: 'INT', email: 'VARCHAR', created: 'TIMESTAMP' } } },
        { id: '2', type: 'database', position: { x: 300, y: 150 }, data: { label: 'Orders', properties: { id: 'INT', userId: 'INT', total: 'DECIMAL' } } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', label: '1 to many', animated: false }
      ],
      theme: 'blueprint',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'template-architecture',
      title: 'Microservices Gateway Architecture',
      description: 'API routing setup with Client, Auth verification layers, and downstream handlers.',
      type: 'architecture',
      nodes: [
        { id: 'a1', type: 'architecture', position: { x: 50, y: 100 }, data: { label: 'Client (Web/App)' } },
        { id: 'a2', type: 'architecture', position: { x: 250, y: 100 }, data: { label: 'Kong API Gateway' } },
        { id: 'a3', type: 'architecture', position: { x: 450, y: 50 }, data: { label: 'Auth Service' } },
        { id: 'a4', type: 'architecture', position: { x: 450, y: 150 }, data: { label: 'Billing API' } }
      ],
      edges: [
        { id: 'ea1-2', source: 'a1', target: 'a2', animated: true },
        { id: 'ea2-3', source: 'a2', target: 'a3', animated: true },
        { id: 'ea2-4', source: 'a2', target: 'a4', animated: true }
      ],
      theme: 'blueprint',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'template-cloud',
      title: 'Multi-AZ AWS Infrastructure',
      description: 'Route 53, Application Load Balancers, and EC2 Auto-Scaling Groups in private subnets.',
      type: 'cloud',
      nodes: [
        { id: 'c1', type: 'cloud', position: { x: 50, y: 100 }, data: { label: 'Route 53 DNS' } },
        { id: 'c2', type: 'cloud', position: { x: 200, y: 100 }, data: { label: 'Elastic Load Balancer' } },
        { id: 'c3', type: 'cloud', position: { x: 380, y: 40 }, data: { label: 'ECS Task Instance A' } },
        { id: 'c4', type: 'cloud', position: { x: 380, y: 160 }, data: { label: 'ECS Task Instance B' } }
      ],
      edges: [
        { id: 'ec1-2', source: 'c1', target: 'c2', animated: true },
        { id: 'ec2-3', source: 'c2', target: 'c3', animated: true },
        { id: 'ec2-4', source: 'c2', target: 'c4', animated: true }
      ],
      theme: 'blueprint',
      updatedAt: new Date().toISOString()
    }
  ];

  const handleLoadTemplate = (tpl: SavedDiagram) => {
    loadDiagram(tpl);
    navigate('/editor');
  };

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
          Diagram Showcase & Examples
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
          Get inspired by clean system architectures, database normalization schemas, and cloud deployment flowcharts. Click to open directly in the canvas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sampleTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="group rounded-2xl glass-effect p-6 flex flex-col justify-between hover:border-brand-orange/30 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_40px_rgba(255,107,53,0.05)] hover:scale-[1.01] transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                {tpl.type === 'er' && <Database className="w-5 h-5" />}
                {tpl.type === 'architecture' && <Network className="w-5 h-5" />}
                {tpl.type === 'cloud' && <Cloud className="w-5 h-5" />}
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-md font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tpl.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLoadTemplate(tpl)}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Load Template</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Examples;
