import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';

@Injectable()
export class FileDetectorRegistry {
  private readonly detectors: IFileDetector[] = [];

  register(detector: IFileDetector): void {
    this.detectors.push(detector);
    // Sort detectors dynamically by priority descending
    this.detectors.sort((a, b) => b.priority - a.priority);
  }

  getDetectors(): IFileDetector[] {
    return this.detectors;
  }
}
