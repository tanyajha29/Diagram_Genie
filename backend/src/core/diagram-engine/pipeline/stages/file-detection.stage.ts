import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PipelineStage } from '../pipeline-stage.interface';
import { GenerationContext } from '../../context/generation.context';
import { FileDetectionService } from '../../file-detector/file-detection.service';
import { DetectedFileType } from '../../file-detector/types/file-type.enum';

@Injectable()
export class FileDetectionStage implements PipelineStage {
  readonly id = 'file-detection-stage';
  readonly order = 20;
  readonly enabled = true;
  readonly required = true;
  private readonly logger = new Logger(FileDetectionStage.name);

  constructor(private readonly fileDetectionService: FileDetectionService) {}

  supports(context: GenerationContext): boolean {
    // Only detect if sourceType was not explicitly provided by client
    return !context.request.sourceType;
  }

  async execute(context: GenerationContext): Promise<void> {
    const { filename, mimeType, source, options } = context.request;

    // 1. Check if user explicitly selected a format in options or top-level sourceType
    const explicitFormat = options?.formatId || options?.sourceType || context.request.sourceType;
    
    const isGeneric = !explicitFormat || 
      explicitFormat === 'architecture' || 
      explicitFormat === 'default' || 
      explicitFormat === 'plain-text' || 
      explicitFormat === 'plain_text';

    if (!isGeneric) {
      context.request.sourceType = this.normalizeFormatId(explicitFormat!);
      this.logger.log(`Using explicit/resolved selection: ${context.request.sourceType}`);
      return;
    }

    // 2. Perform Sniffing
    const detected = this.fileDetectionService.detect(
      filename || '',
      mimeType || '',
      source || ''
    );

    // 3. Resolve Ambiguity for YAML / JSON / TXT files
    let resolvedFormat = this.resolveSniffedFormat(detected, source || '');

    if (!resolvedFormat) {
      throw new BadRequestException(
        'Ambiguous or unsupported file format. Please explicitly select the format (e.g. OpenAPI or Docker Compose).'
      );
    }

    context.request.sourceType = resolvedFormat;
    this.logger.log(`Auto-detected resolved format: ${context.request.sourceType}`);
  }

  private normalizeFormatId(id: string): string {
    const lower = id.toLowerCase();
    if (lower === 'sql' || lower === 'sql-ddl') return 'sql';
    if (lower === 'prisma' || lower === 'prisma-schema') return 'prisma';
    if (lower === 'sequence' || lower === 'uml-sequence') return 'sequence';
    if (lower === 'uml' || lower === 'uml-dsl') return 'uml';
    if (lower === 'flowchart' || lower === 'flow-dsl' || lower === 'flow') return 'flowchart';
    if (lower === 'terraform' || lower === 'tf') return 'terraform';
    if (lower === 'docker-compose' || lower === 'compose') return 'docker-compose';
    if (lower === 'cloud' || lower === 'cloud-dsl') return 'cloud';
    if (lower === 'openapi' || lower === 'swagger') return 'openapi';
    if (lower === 'markdown-outline' || lower === 'markdown' || lower === 'outline' || lower === 'mindmap' || lower === 'md') return 'markdown-outline';
    if (lower === 'pipeline' || lower === 'pipeline-dsl') return 'pipeline';
    if (lower === 'architecture' || lower === 'architecture-dsl') return 'architecture';
    if (lower === 'api-dsl') return 'architecture';
    return lower;
  }

  private resolveSniffedFormat(type: DetectedFileType, content: string): string | null {
    const lower = content.toLowerCase();

    if (type === DetectedFileType.YAML) {
      if (lower.includes('services:')) {
        return 'docker-compose';
      }
      if (lower.includes('openapi:') || lower.includes('swagger:')) {
        return 'openapi';
      }
      return null; // Ambiguous YAML
    }

    if (type === DetectedFileType.JSON) {
      if (lower.includes('"openapi"') || lower.includes('"swagger"') || lower.includes('"paths"')) {
        return 'openapi';
      }
      return null; // Ambiguous JSON
    }

    const typeMapping: Record<DetectedFileType, string | null> = {
      [DetectedFileType.README]: 'markdown-outline',
      [DetectedFileType.MARKDOWN]: 'markdown-outline',
      [DetectedFileType.SQL]: 'sql',
      [DetectedFileType.PRISMA]: 'prisma',
      [DetectedFileType.DOCKER_COMPOSE]: 'docker-compose',
      [DetectedFileType.TERRAFORM]: 'terraform',
      [DetectedFileType.OPENAPI]: 'openapi',
      [DetectedFileType.YAML]: null,
      [DetectedFileType.JSON]: null,
      [DetectedFileType.PLAIN_TEXT]: 'architecture',
    };

    return typeMapping[type] || 'architecture';
  }
}
