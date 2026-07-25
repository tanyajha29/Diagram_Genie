import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class PrismaDetector implements IFileDetector {
  readonly id = 'prisma-detector';
  readonly priority = 75;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check extension
    if (fn.endsWith('.prisma')) {
      return DetectedFileType.PRISMA;
    }

    // Check content parameters
    if (content) {
      const lower = content.toLowerCase();
      const hasDatasource = lower.includes('datasource ');
      const hasGenerator = lower.includes('generator ');
      const hasModel = lower.includes('model ') && lower.includes('{');
      if (hasDatasource || hasGenerator || hasModel) {
        return DetectedFileType.PRISMA;
      }
    }

    return null;
  }
}
