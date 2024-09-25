import { Token, TokenType } from "./lexer.ts";
import {
  BinaryExpr,
  CompoundStmt,
  Expr,
  ExprStmt,
  NumericExpr,
  ParenthesizedExpr,
  ParserError,
  Stmt,
  StringExpr,
  VariableStmt,
} from "./helper.ts";

enum Bp {
  LOWEST = 0,
  ADDITIVE = 10,
  MULTIPLICATIVE = 20,
}

export class Parser {
  currentToken: Token;
  pos: number;
  tokens: Array<Token>;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentToken = this.tokens[0];
    this.pos = 0;
  }

  private advance(): void {
    this.pos++;
    if (this.pos < this.tokens.length) {
      this.currentToken = this.tokens[this.pos];
    } else {
      this.currentToken = { type: TokenType.EOF, value: "" };
    }
  }

  private consume(expected: TokenType): void {
    if (this.currentToken.type !== expected) {
      throw new ParserError(`Expected ${expected}, found ${this.currentToken.type}`);
    }
    this.advance();
  }

  getBindingPower(type: TokenType): Bp {
    switch (type) {
      case TokenType.PLUS:
      case TokenType.DASH:
        return Bp.ADDITIVE;
      case TokenType.SLASH:
      case TokenType.STAR:
        return Bp.MULTIPLICATIVE;
      default:
        return Bp.LOWEST;
    }
  }

  expr(bp: Bp): Expr {
    let left = this.nud();
    while (this.getBindingPower(this.currentToken.type) > bp) {
      left = this.led(left);
    }
    return left;
  }

  parse(): Stmt {
    const ast = new CompoundStmt([]);
    while (this.currentToken.type !== TokenType.EOF) {
      ast.body.push(this.program());
    }
    return ast;
  }

  program(): Stmt {
    if (this.currentToken.type === TokenType.K_LET) {
      this.advance();
      return this.variableDecl(false);
    } else if (this.currentToken.type === TokenType.K_CONST) {
      this.advance();
      return this.variableDecl(true);
    }
    return this.stmt();
  }

  variableDecl(isConst: boolean): Stmt {
    this.consume(TokenType.IDENTIFIER);
    const name = this.currentToken.value;

    this.consume(TokenType.EQUALS);
    const value = this.expr(Bp.LOWEST);
    this.consume(TokenType.SEMI);

    return new VariableStmt(name ?? '', value, isConst);
  }

  stmt(): Stmt {
    const expression = this.expr(Bp.LOWEST);
    this.consume(TokenType.SEMI);
    return new ExprStmt(expression);
  }

  nud(): Expr {
    switch (this.currentToken.type) {
      // deno-lint-ignore no-case-declarations
      case TokenType.LPAREN:
        this.advance(); // Consume '('
        const expr = this.expr(Bp.LOWEST);
        this.consume(TokenType.RPAREN);
        return new ParenthesizedExpr(expr);
      // deno-lint-ignore no-case-declarations
      case TokenType.IDENTIFIER:
        const exprIdent = new StringExpr(this.currentToken.value ?? '');
        this.advance(); // Consume identifier
        return exprIdent;
      // deno-lint-ignore no-case-declarations
      case TokenType.NUMBER:
        const value = parseInt(this.currentToken.value ?? '');
        this.advance(); // Consume number
        return new NumericExpr(value);
      default:
        throw new ParserError(`Unexpected token: ${this.currentToken.type}`);
    }
  }

  led(left: Expr): Expr {
    const operator = this.currentToken.type;
    this.advance(); // Consume operator
    const right = this.expr(this.getBindingPower(operator));
    return new BinaryExpr(left, right, operator);
  }
}
