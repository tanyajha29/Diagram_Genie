export enum TokenType {
  WORD = 'WORD',
  PUNCTUATION = 'PUNCTUATION',
  ARROW = 'ARROW',
  NEWLINE = 'NEWLINE',
  INDENT = 'INDENT',
  KEYWORD = 'KEYWORD',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

/**
 * Lightweight deterministic lexer.
 * Scans text line-by-line, extracting keywords, operators, spacing, and structural tokens.
 */
export class Lexer {
  static tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    const lines = text.split('\n');

    lines.forEach((lineText, lineIdx) => {
      const lineNum = lineIdx + 1;
      
      // 1. Capture leading whitespace indentations (crucial for Markdown bullet nestings)
      const indentMatch = lineText.match(/^(\s+)/);
      const indentSize = indentMatch ? indentMatch[1].length : 0;
      if (indentSize > 0) {
        tokens.push({
          type: TokenType.INDENT,
          value: ' '.repeat(indentSize),
          line: lineNum,
          column: 1
        });
      }

      const trimmed = lineText.trim();
      if (!trimmed) {
        tokens.push({
          type: TokenType.NEWLINE,
          value: '\n',
          line: lineNum,
          column: lineText.length + 1
        });
        return;
      }

      // 2. Scan and extract tokens via regex match bounds
      const tokenRegex = /(<->|-->|->|=>|create\s+table|primary\s+key|foreign\s+key|references|[a-zA-Z_0-9]+|[{}[\](),:;*#+-])/gi;
      let match;
      
      while ((match = tokenRegex.exec(lineText)) !== null) {
        const value = match[0];
        const column = match.index + 1;
        
        let type = TokenType.WORD;
        const valLower = value.toLowerCase();

        if (['<->', '-->', '->', '=>'].includes(value)) {
          type = TokenType.ARROW;
        } else if (['{', '}', '[', ']', '(', ')', ',', ':', ';', '*', '#', '+', '-'].includes(value)) {
          type = TokenType.PUNCTUATION;
        } else if (['create table', 'primary key', 'foreign key', 'references'].includes(valLower)) {
          type = TokenType.KEYWORD;
        }

        tokens.push({
          type,
          value,
          line: lineNum,
          column
        });
      }

      // 3. Append newline token marking boundary of lines
      tokens.push({
        type: TokenType.NEWLINE,
        value: '\n',
        line: lineNum,
        column: lineText.length + 1
      });
    });

    return tokens;
  }
}
