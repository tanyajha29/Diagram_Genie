import { Injectable } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { FileDetectionService } from '../../file-detector/file-detection.service';

@Injectable()
export class FileDetectionStage implements PipelineStage {
  readonly id = 'file-detection-stage';
  readonly order = 20;
  readonly enabled = true;
  readonly required = true;

  constructor(private readonly fileDetectionService: FileDetectionService) {}

  supports(context: GenerationContext): boolean {
    // Only detect if sourceType was not explicitly provided by client
    return !context.request.sourceType;
  }

  async execute(context: GenerationContext): Promise<void> {
    const { filename, mimeType, source } = context.request;
    const detected = this.fileDetectionService.detect(filename, mimeType, source);
    context.detectedFileType = detected;
  }
}
