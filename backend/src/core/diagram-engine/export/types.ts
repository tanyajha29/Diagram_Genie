export interface ExportNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  parentId?: string;
  description?: string;
  properties?: Record<string, string>;
}

export interface ExportEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  animated?: boolean;
}

export interface NormalizedLayoutGraph {
  nodes: ExportNode[];
  edges: ExportEdge[];
  metadata?: any;
}

export interface ExportOptions {
  theme: 'light' | 'dark' | 'neutral';
  padding?: number;
}

export interface ExportColorTheme {
  background: string;
  text: string;
  mutedText: string;
  edge: string;
  arrow: string;
  containerBorder: string;
  containerBackground: string;
  cardBackground: string;
  cardBorder: string;
  nodeThemes: Record<string, {
    bg: string;
    border: string;
    text: string;
    accent: string;
  }>;
}
