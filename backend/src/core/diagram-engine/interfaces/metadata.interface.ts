export interface DiagramMetadata {
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
  engineVersion: string;
  tags?: string[];
  sourceType?: string; // 'text', 'sql', 'markdown', etc.
}
