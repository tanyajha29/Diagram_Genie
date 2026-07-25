import { Injectable, Logger } from '@nestjs/common';
import { IParser } from '../interfaces/parser.interface';

@Injectable()
export class ParserRegistry {
  private readonly parsersMap = new Map<string, IParser>();
  private readonly logger = new Logger(ParserRegistry.name);

  register(parser: IParser): void {
    this.parsersMap.set(parser.id, parser);
    this.logger.log(`Registered parser plugin: ${parser.id}`);
  }

  getParser(sourceType: string): IParser | undefined {
    // Avoid if/else statements - dynamically scan matching supports rule
    return Array.from(this.parsersMap.values()).find((parser) =>
      parser.supports(sourceType)
    );
  }

  getParsers(): IParser[] {
    return Array.from(this.parsersMap.values());
  }
}
