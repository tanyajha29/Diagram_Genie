import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class MarkdownDetector implements IFileDetector {
  readonly id = 'markdown-detector';
  readonly priority = 60;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check extension or mimeType
    if (fn.endsWith('.md') || fn.endsWith('.markdown') || mimeType === 'text/markdown') {
      return DetectedFileType.MARKDOWN;
    }

    // Check content starts with markdown headers/list
    if (content) {
      const trimmed = content.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('##') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return DetectedFileType.MARKDOWN;
      }
    }

    return null;
  }
}
