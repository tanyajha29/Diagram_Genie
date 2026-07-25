import { Injectable, Logger } from '@nestjs/common';
import { FileDetectorRegistry } from './registry/file-detector.registry';
import { DetectedFileType } from './types/file-type.enum';

@Injectable()
export class FileDetectionService {
  private readonly logger = new Logger(FileDetectionService.name);

  constructor(private readonly registry: FileDetectorRegistry) {}

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType {
    this.logger.debug(`Executing file detection scanner: name=${filename}, mime=${mimeType}`);

    for (const detector of this.registry.getDetectors()) {
      const result = detector.detect(filename, mimeType, content);
      if (result) {
        this.logger.log(`Detected file category: ${result} [scanner: ${detector.id}]`);
        return result;
      }
    }

    this.logger.debug(`No matching scanner resolved. Defaulting to plain text formatting.`);
    return DetectedFileType.PLAIN_TEXT;
  }
}
