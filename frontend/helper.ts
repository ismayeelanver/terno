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
    case "def": {
      return MakeToken(TokenType.K_DEF);
    }
    case "return": {
      return MakeToken(TokenType.K_RETURN);
    }
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
  type = "UndefinedExpression";
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

export interface Parameter {
  type: type;
  name: string;
}

export class Param {
  parameters: Parameter[] = [];
  constructor() {
    this.parameters = [];
  }

  add(Type: type, name: string) {
    this.parameters.push({ type: Type, name: name } as Parameter);
  }
}

export class FunctionCall implements Expr {
  type = "FunctionCallExpression";
  constructor(public name: string, public param: Param) {}
}

export interface Stmt {
  type: string;
}

export class ExprStmt implements Stmt {
  type = "Expr";
  constructor(public value: Expr) {}
}

export class FunctionStmt implements Stmt{
  type = "Function"
  constructor(public name: string, public param: Param, public Type: type, public body: CompoundStmt) {}
}

export class VariableStmt implements Stmt {
  type = "Variable";
  constructor(
    public name: string,
    public value: Expr,
    public is_const: boolean,
    public Type: type,
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

export class ReturnStmt implements Stmt {
  type = "Return";
  constructor(public value: Expr) {}
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
    this.name = "ParserError";
  }
}

export interface type {
  type: string;
}

export class CustomType implements type {
  type = "Type";
  constructor(public type_name: string) {
  }
}

export class ImplicitType implements type {
  type = "Implicit";
}

export class ArrayType implements type {
  type = "Array";
  constructor(public Type: type) {
  }
}
