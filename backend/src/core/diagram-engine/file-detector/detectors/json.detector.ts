import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class JsonDetector implements IFileDetector {
  readonly id = 'json-detector';
  readonly priority = 40;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check extension or mimeType
    if (fn.endsWith('.json') || mimeType === 'application/json') {
      return DetectedFileType.JSON;
    }

    // Check string format content
    if (content) {
      const trimmed = content.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return DetectedFileType.JSON;
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return DetectedFileType.JSON;
      }
    }

    return null;
  }
}
