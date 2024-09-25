import {
  defaultHandler,
  numberHandler,
  skipHandler,
  symbolHandler,
  TokenHandler,
} from "./helper.ts";
export enum TokenType {
  EOF = '\0',
  LPAREN = '(',
  RPAREN = ')',
  NUMBER = 'number',
  IDENTIFIER = 'id',
  PLUS = '+',
  EQUALS = '=',
  SEMI = ';',
  DASH = '-',
  SLASH = '/',
  STAR = '*',
  K_LET = 'let',
  K_CONST = 'const'
}

export type Token = {
  type: TokenType;
  value?: string;
};

export const MakeToken = (type: TokenType, value?: string): Token => ({
  type,
  value,
});

type RegexTokenHandler = {
  pattern: RegExp;
  handler: TokenHandler;
};

const RegexHandler = (
  pattern: string,
  handler: TokenHandler,
): RegexTokenHandler => ({
  pattern: new RegExp(pattern),
  handler,
});

export default class Lexer {
  tokens: Token[] = [];
  readonly contents: string;
  readonly position = { value: 0 };

  constructor(contents: string) {
    this.contents = contents;
  }

  MakeTokens(): Token[] {
    const MatchToken: RegexTokenHandler[] = [
      RegexHandler(`\/\/.*`, skipHandler),
      RegexHandler(`\\s+`, skipHandler),
      RegexHandler(`\\(`, defaultHandler(TokenType.LPAREN)),
      RegexHandler(`\\)`, defaultHandler(TokenType.RPAREN)),
      RegexHandler("\\+", defaultHandler(TokenType.PLUS)),
      RegexHandler("\\-", defaultHandler(TokenType.DASH)),
      RegexHandler("\\/", defaultHandler(TokenType.SLASH)),
      RegexHandler("\\*", defaultHandler(TokenType.STAR)),
      RegexHandler("\\=", defaultHandler(TokenType.EQUALS)),
      RegexHandler("\\;", defaultHandler(TokenType.SEMI)),
      RegexHandler(`\\d+`, numberHandler),
      RegexHandler(`[a-zA-Z_@][a-zA-Z0-9_]*`, symbolHandler),
    ];

    while (this.position.value < this.contents.length) {
      let matchFound = false;
      const remainingContents = this.contents.slice(this.position.value);

      for (const { pattern, handler } of MatchToken) {
        const match = pattern.exec(remainingContents);
        if (match && match.index === 0) {
          const token = handler(match[0], this.position);
          if (token) this.tokens.push(token);
          matchFound = true;
          break;
        }
      }

      if (!matchFound) {
        throw new Error(
          `Unexpected character at position ${this.position.value}, ${
            this.contents[this.position.value]
          }`,
        );
      }
    }

    this.tokens.push(MakeToken(TokenType.EOF, "\0"))

    return this.tokens;
  }
}
