import { Diagram } from './diagram.interface';

export interface DiagramParser {
  id: string;
  supportedTypes: string[]; // ['sql', 'markdown', 'typescript']
  parse(source: string, options?: Record<string, any>): Promise<Diagram>;
}
