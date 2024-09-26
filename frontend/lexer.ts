import {
  defaultHandler,
  numberHandler,
  skipHandler,
  symbolHandler,
  TokenHandler,
} from "./helper.ts";
export enum TokenType {
  EOF = "\0",
  LPAREN = "(",
  RPAREN = ")",
  NUMBER = "number",
  IDENTIFIER = "id",
  PLUS = "+",
  EQUALS = "=",
  SEMI = ";",
  DASH = "-",
  SLASH = "/",
  STAR = "*",
  BIT_OR = "|",
  BIT_AND = "&",
  AND = "&&",
  OR = "||",
  PLUS_EQUALS = "+=",
  MINUS_EQUALS = "-=",
  EQUALS_EQUALS = "==",
  BANG_EQUALS = "!=",
  COLON = ":",
  COMMA = ",",
  LSB = "[",
  RSB = "]",
  LCB = "{",
  RCB = "}",

  K_LET = "let",
  K_CONST = "const",
  K_DEF = "def",
  K_RETURN = "return",
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
      RegexHandler("\\+=", defaultHandler(TokenType.PLUS_EQUALS)),
      RegexHandler("\\-=", defaultHandler(TokenType.MINUS_EQUALS)),
      RegexHandler("\\==", defaultHandler(TokenType.EQUALS_EQUALS)),
      RegexHandler("\\!=", defaultHandler(TokenType.BANG_EQUALS)),
      RegexHandler("\\||", defaultHandler(TokenType.OR)),
      RegexHandler("\\&&", defaultHandler(TokenType.AND)),
      RegexHandler(`\\(`, defaultHandler(TokenType.LPAREN)),
      RegexHandler(`\\)`, defaultHandler(TokenType.RPAREN)),
      RegexHandler("\\+", defaultHandler(TokenType.PLUS)),
      RegexHandler("\\-", defaultHandler(TokenType.DASH)),
      RegexHandler("\\/", defaultHandler(TokenType.SLASH)),
      RegexHandler("\\*", defaultHandler(TokenType.STAR)),
      RegexHandler("\\=", defaultHandler(TokenType.EQUALS)),
      RegexHandler("\\;", defaultHandler(TokenType.SEMI)),
      RegexHandler("\\:", defaultHandler(TokenType.COLON)),
      RegexHandler("\\,", defaultHandler(TokenType.COMMA)),
      RegexHandler("\\[", defaultHandler(TokenType.LSB)),
      RegexHandler("\\]", defaultHandler(TokenType.RSB)),
      RegexHandler("\\{", defaultHandler(TokenType.LCB)),
      RegexHandler("\\}", defaultHandler(TokenType.RCB)),
      RegexHandler("\\|", defaultHandler(TokenType.BIT_OR)),
      RegexHandler("\\&", defaultHandler(TokenType.BIT_AND)),
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

    this.tokens.push(MakeToken(TokenType.EOF, "\0"));

    return this.tokens;
  }
}
