import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class YamlDetector implements IFileDetector {
  readonly id = 'yaml-detector';
  readonly priority = 30;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check extension or mimeType
    if (fn.endsWith('.yaml') || fn.endsWith('.yml') || mimeType === 'text/yaml' || mimeType === 'application/x-yaml') {
      return DetectedFileType.YAML;
    }

    // Check basic YAML properties
    if (content) {
      const lines = content.split('\n');
      const isYamlContent = lines.some(line => line.includes(':') && !line.trim().startsWith('#') && !line.includes('//'));
      if (isYamlContent) {
        return DetectedFileType.YAML;
      }
    }

    return null;
  }
}
