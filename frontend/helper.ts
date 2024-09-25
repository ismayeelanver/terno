import { MakeToken, Token, TokenType } from "./lexer.ts";

export type TokenHandler = (s: string, pos: { value: number }) => Token | null;
// Handlers
export const skipHandler: TokenHandler = (
  s: string,
  pos: { value: number },
) => {
  pos.value += s.length;
  return null; // No token for skip
};

export const defaultHandler =
  (type: TokenType): TokenHandler => (s: string, pos: { value: number }) => {
    pos.value += s.length;
    return MakeToken(type, s);
  };

export const numberHandler: TokenHandler = (
  s: string,
  pos: { value: number },
) => {
  pos.value += s.length;
  return MakeToken(TokenType.NUMBER, s);
};

export const symbolHandler: TokenHandler = (
  s: string,
  pos: { value: number },
) => {
  pos.value += s.length;
  return MakeToken(TokenType.IDENTIFIER, s);
};

export interface Expr {
  type: string;
  evaluate(): any;
}

export class BinaryExpr implements Expr {
  type = "BinaryExression";
  constructor(public left: Expr, public right: Expr, public op: TokenType) {}
  evaluate() {
    switch (this.op) {
      case TokenType.PLUS: {
        return this.left.evaluate() + this.right.evaluate();
      }
      case TokenType.DASH: {
        return this.left.evaluate() - this.right.evaluate();
      }
      case TokenType.SLASH: {
        return this.left.evaluate() / this.right.evaluate();
      }
      case TokenType.STAR: {
        return this.left.evaluate() * this.right.evaluate();
      }
    }
  }
}

export class NumericExpr implements Expr {
  type = "NumericExpression";
  constructor(public value: number) {}
  evaluate() {
    return this.value;
  }
}

export class IdentifierExpr implements Expr {
  type = "IdentifierExpression";
  constructor(public value: string) {}
  evaluate() {
    return this.value;
  }
}

export class StringExpr implements Expr {
  type = "StringExpression";
  constructor(public value: string) {}
  evaluate() {
    return this.value;
  }
}

export class ParenthesizedExpr implements Expr {
  type = "ParenthesizedExpression";
  constructor(public value: Expr) {}
  evaluate() {
    return this.value.evaluate();
  }
}

export class Red {
  constructor(str: string) {
    return `\x1b[31m${str}\x1b[0m`;
  }
}

export class UnexpectedTokenError implements Error {
  message: string;
  name: string;
  stack?: string | undefined;

  constructor() {
    this.name = `Lexical Error:\n`;
    this.message = `\tUnexpected Token`;
    console.error(new Red(this.name), this.message);
    Deno.exit(1);
  }
}

export class ParserError implements Error {
  message: string;
  name: string;
  stack?: string | undefined;

  constructor() {
    this.name = `Parsing Error:\n`;
    this.message = `\tUnable to parse your code!`;
    console.error(new Red(this.name), this.message);
    Deno.exit(1);
  }
}
