import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, type Node, type Edge, type OnNodesChange, type OnEdgesChange } from '@xyflow/react';

export interface SavedDiagram {
  id: string;
  title: string;
  description: string;
  type: string;
  nodes: Node[];
  edges: Edge[];
  theme: 'light' | 'dark' | 'blueprint' | 'neon';
  updatedAt: string;
  isFavorite?: boolean;
}

interface DiagramHistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface DiagramState {
  // Theme state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Active diagram state
  currentId: string | null;
  title: string;
  description: string;
  toolId: string;
  nodes: Node[];
  edges: Edge[];

  // Undo/Redo stacks
  past: DiagramHistoryState[];
  future: DiagramHistoryState[];

  // Saved diagrams list (mock database)
  savedDiagrams: SavedDiagram[];

  // Actions
  initNewDiagram: (toolId: string, title: string, description: string) => void;
  loadDiagram: (saved: SavedDiagram) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  
  // Custom updates
  updateNodeLabel: (nodeId: string, newLabel: string, properties?: Record<string, string>) => void;
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  clearCanvas: () => void;

  // History Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Storage Actions
  saveCurrent: () => void;
  deleteSaved: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

// Initial mock data
const INITIAL_SAVED_DIAGRAMS: SavedDiagram[] = [
  {
    id: '1',
    title: 'E-Commerce Database Schema',
    description: 'Relational database schema for managing users, products, and shopping orders.',
    type: 'er',
    nodes: [],
    edges: [],
    theme: 'blueprint',
    updatedAt: '2026-07-24T18:00:00Z',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'AWS Cloud Hosting Stack',
    description: 'VPC subnets, ECS containers, and Load Balancers configuration.',
    type: 'cloud',
    nodes: [],
    edges: [],
    theme: 'light',
    updatedAt: '2026-07-23T12:00:00Z',
    isFavorite: false,
  }
];

// Force dark mode on startup
document.documentElement.classList.add('dark');

export const useDiagramStore = create<DiagramState>((set, get) => ({
  theme: 'dark',
  setTheme: () => {},

  currentId: null,
  title: 'Untitled Diagram',
  description: 'AI-generated custom diagram',
  toolId: 'flowchart',
  nodes: [],
  edges: [],
  past: [],
  future: [],
  savedDiagrams: INITIAL_SAVED_DIAGRAMS,

  initNewDiagram: (toolId, title, description) => {
    set({
      currentId: Math.random().toString(36).substring(2),
      title,
      description,
      toolId,
      nodes: [],
      edges: [],
      past: [],
      future: [],
    });
  },

  loadDiagram: (saved) => {
    set({
      currentId: saved.id,
      title: saved.title,
      description: saved.description,
      toolId: saved.type,
      nodes: saved.nodes,
      edges: saved.edges,
      past: [],
      future: [],
    });
  },

  setNodes: (nodes) => {
    set({ nodes });
  },

  setEdges: (edges) => {
    set({ edges });
  },

  onNodesChange: (changes) => {
    set((state) => {
      // Push history before changes to allow undoing
      const nextNodes = applyNodeChanges(changes, state.nodes);
      return { nodes: nextNodes };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges);
      return { edges: nextEdges };
    });
  },

  updateNodeLabel: (nodeId, newLabel, properties) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
              properties: properties || (node.data?.properties as Record<string, string>) || {},
            },
          };
        }
        return node;
      }),
    }));
  },

  addNode: (newNode) => {
    get().pushHistory();
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  deleteNode: (nodeId) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  },

  clearCanvas: () => {
    get().pushHistory();
    set({ nodes: [], edges: [] });
  },

  pushHistory: () => {
    const { nodes, edges, past } = get();
    // Cap history size at 30
    const newPast = [...past, { nodes: [...nodes], edges: [...edges] }].slice(-30);
    set({
      past: newPast,
      future: [], // Clear redo stack on new action
    });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future],
    });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: newFuture,
    });
  },

  saveCurrent: () => {
    const { currentId, title, description, toolId, nodes, edges, savedDiagrams } = get();
    const id = currentId || Math.random().toString(36).substring(2);
    
    const index = savedDiagrams.findIndex((d) => d.id === id);
    const updatedDiagram: SavedDiagram = {
      id,
      title,
      description,
      type: toolId,
      nodes,
      edges,
      theme: 'blueprint',
      updatedAt: new Date().toISOString(),
      isFavorite: index >= 0 ? savedDiagrams[index].isFavorite : false,
    };

    set((state) => {
      const nextSaved = [...state.savedDiagrams];
      if (index >= 0) {
        nextSaved[index] = updatedDiagram;
      } else {
        nextSaved.unshift(updatedDiagram);
      }
      return {
        currentId: id,
        savedDiagrams: nextSaved,
      };
    });
  },

  deleteSaved: (id) => {
    set((state) => ({
      savedDiagrams: state.savedDiagrams.filter((d) => d.id !== id),
    }));
  },

  toggleFavorite: (id) => {
    set((state) => ({
      savedDiagrams: state.savedDiagrams.map((d) => {
        if (d.id === id) {
          return { ...d, isFavorite: !d.isFavorite };
        }
        return d;
      }),
    }));
  },
}));
