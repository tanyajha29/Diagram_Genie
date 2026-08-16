import { ParserResult } from '../parsers/parser-result.interface';

export interface IParser {
  id: string;
  supports(sourceType: string): boolean;
  validate(source: string): boolean;
  parse(source: string, options?: Record<string, any>): Promise<ParserResult>;
}

