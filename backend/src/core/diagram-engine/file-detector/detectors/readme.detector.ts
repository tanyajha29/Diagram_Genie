import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class ReadmeDetector implements IFileDetector {
  readonly id = 'readme-detector';
  readonly priority = 70;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check specific name structure
    if (fn === 'readme.md' || fn === 'readme.txt' || fn === 'readme.markdown' || fn === 'readme') {
      return DetectedFileType.README;
    }

    return null;
  }
}
