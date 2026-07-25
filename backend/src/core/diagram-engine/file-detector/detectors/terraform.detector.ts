import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class TerraformDetector implements IFileDetector {
  readonly id = 'terraform-detector';
  readonly priority = 80;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check extension
    if (fn.endsWith('.tf') || fn.endsWith('.tfvars')) {
      return DetectedFileType.TERRAFORM;
    }

    // Check content parameters
    if (content) {
      const lower = content.toLowerCase();
      const hasResource = lower.includes('resource ') && lower.includes('"');
      const hasProvider = lower.includes('provider ') && lower.includes('"');
      const hasVariable = lower.includes('variable ') && lower.includes('{');
      if (hasResource || hasProvider || hasVariable) {
        return DetectedFileType.TERRAFORM;
      }
    }

    return null;
  }
}
