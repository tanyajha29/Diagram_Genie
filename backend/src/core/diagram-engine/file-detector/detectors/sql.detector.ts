import { Injectable } from '@nestjs/common';
import { IFileDetector } from '../interfaces/file-detector.interface';
import { FileDetectorRegistry } from '../registry/file-detector.registry';
import { DetectedFileType } from '../types/file-type.enum';

@Injectable()
export class SqlDetector implements IFileDetector {
  readonly id = 'sql-detector';
  readonly priority = 50;

  constructor(private readonly registry: FileDetectorRegistry) {
    this.registry.register(this);
  }

  detect(filename?: string, mimeType?: string, content?: string): DetectedFileType | null {
    const fn = filename?.toLowerCase() || '';

    // Check extension or mimeType
    if (fn.endsWith('.sql') || mimeType === 'text/x-sql' || mimeType === 'application/sql') {
      return DetectedFileType.SQL;
    }

    // Check query syntax content
    if (content) {
      const lower = content.toLowerCase();
      const hasCreateTable = lower.includes('create table');
      const hasSelect = lower.includes('select ') && lower.includes('from ');
      const hasInsert = lower.includes('insert into');
      const hasAlterTable = lower.includes('alter table') || lower.includes('foreign key');
      if (hasCreateTable || hasSelect || hasInsert || hasAlterTable) {
        return DetectedFileType.SQL;
      }
    }

    return null;
  }
}
