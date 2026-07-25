import { DetectedFileType } from '../types/file-type.enum';

export interface IFileDetector {
  id: string;
  priority: number;
  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null;
}
