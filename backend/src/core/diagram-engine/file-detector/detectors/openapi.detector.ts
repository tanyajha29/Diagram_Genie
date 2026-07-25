import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class OpenApiDetector implements IFileDetector {
  readonly id = 'openapi-detector';
  readonly priority = 85;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check content parameters first (OpenAPI can be YAML or JSON)
    if (content) {
      const lower = content.toLowerCase();
      const hasOpenApi = lower.includes('"openapi":') || lower.includes('openapi:') || lower.includes('"swagger":') || lower.includes('swagger:');
      const hasPaths = lower.includes('paths:') || lower.includes('"paths":');
      if (hasOpenApi && hasPaths) {
        return DetectedFileType.OPENAPI;
      }
    }

    if (fn.includes('openapi') || fn.includes('swagger')) {
      return DetectedFileType.OPENAPI;
    }

    return null;
  }
}
