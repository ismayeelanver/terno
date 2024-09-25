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
  switch (s) {
    case "let": {
      return MakeToken(TokenType.K_LET);
    }
    case "const": {
      return MakeToken(TokenType.K_CONST);
    }
    default: {
      return MakeToken(TokenType.IDENTIFIER, s);
    }
  }
};

export interface Expr {
  type: string;
}

export class UndefinedExpr implements Expr {
  type = "UndefinedExpression"
  constructor() {
  }
}

export class BinaryExpr implements Expr {
  type = "BinaryExression";
  constructor(public left: Expr, public right: Expr, public op: TokenType) {}
}

export class NumericExpr implements Expr {
  type = "NumericExpression";
  constructor(public value: number) {}
}

export class IdentifierExpr implements Expr {
  type = "IdentifierExpression";
  constructor(public value: string) {}
}

export class StringExpr implements Expr {
  type = "StringExpression";
  constructor(public value: string) {}
}

export class ParenthesizedExpr implements Expr {
  type = "ParenthesizedExpression";
  constructor(public value: Expr) {}
}
export interface Stmt {
  type: string;
}

export class ExprStmt implements Stmt {
  type = "Expr";
  constructor(public value: Expr) {}
}

export class VariableStmt implements Stmt {
  type = "Variable";
  constructor(
    public name: string,
    public value: Expr,
    public is_const: boolean,
  ) {}
}

export class CompoundStmt implements Stmt {
  type = "Compound";
  constructor(public body: Stmt[]) {}
}

export class EmptyStmt implements Stmt {
  type = "Empty";
  constructor() {}
}

export const Red = (str: string) => {
  return `\x1b[33m${str}\x1b[0m`;
};

export class UnexpectedTokenError implements Error {
  message: string;
  name: string;
  stack?: string | undefined;

  constructor() {
    this.name = `Lexical Error:\n`;
    this.message = `\tUnexpected Token`;
    console.error(Red(this.name), this.message);
    Deno.exit(1);
  }
}

export class ParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParserError"; // Set the name for better identification
  }
}
