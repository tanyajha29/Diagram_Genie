import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class DockerComposeDetector implements IFileDetector {
  readonly id = 'docker-compose-detector';
  readonly priority = 90;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';
    
    // Check extension
    const isYaml = fn.endsWith('.yaml') || fn.endsWith('.yml') || mimeType?.includes('yaml');
    if (!isYaml && filename) return null;

    // Check content parameters
    if (content) {
      const lower = content.toLowerCase();
      const hasServices = lower.includes('services:');
      const hasVersionOrImage = lower.includes('version:') || lower.includes('image:') || lower.includes('volumes:');
      if (hasServices && hasVersionOrImage) {
        return DetectedFileType.DOCKER_COMPOSE;
      }
    }

    if (fn.includes('docker-compose')) {
      return DetectedFileType.DOCKER_COMPOSE;
    }

    return null;
  }
}
