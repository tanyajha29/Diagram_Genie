import { Injectable, BadRequestException } from '@nestjs/common';
import { ParserRegistry } from '../registry/parser.registry';
import { IParser } from '../interfaces/parser.interface';

@Injectable()
export class ParserFactory {
  constructor(private readonly registry: ParserRegistry) {}

  createParser(sourceType: string): IParser {
    const parser = this.registry.getParser(sourceType);
    if (!parser) {
      throw new BadRequestException(`No suitable parser found for source type: ${sourceType}`);
    }
    return parser;
  }
}
