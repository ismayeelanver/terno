import { Token, TokenType } from "./lexer.ts";
import { BinaryExpr, Expr, NumericExpr, StringExpr, ParserError, ParenthesizedExpr } from "./helper.ts";

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
    if (!left) throw new ParserError();

    while (this.getBindingPower(this.currentToken.type) > bp) {
      left = this.led(left);
    }

    return left;
  }

  eat(): void {
    this.pos++;
    if (this.pos < this.tokens.length) {
      this.currentToken = this.tokens[this.pos];
    } else {
      this.currentToken = { type: TokenType.EOF, value: "" }; // Handle EOF case
    }
  }

  parse(): Expr {
    return this.expr(Bp.LOWEST);
  }

  nud(): Expr | undefined {
    switch (this.currentToken.type) {
      case TokenType.LPAREN: {
        this.eat(); // Consume '('
        let expr = this.expr(Bp.LOWEST);
        if (this.currentToken.type !== TokenType.RPAREN) {
          throw new ParserError();
        }
        this.eat(); // Consume ')'
        return new ParenthesizedExpr(expr);
      }

      case TokenType.IDENTIFIER: {
        const expr = new StringExpr(this.currentToken.value);
        this.eat(); // Consume the identifier
        return expr;
      }

      case TokenType.NUMBER: {
        const value = parseInt(this.currentToken.value);
        if (isNaN(value)) {
          throw new ParserError();
        }
        const expr = new NumericExpr(value);
        this.eat(); // Consume the number
        return expr;
      }

      default:
        throw new ParserError();
    }
  }

  led(left: Expr): Expr {
    const op = this.currentToken.type;
    switch (op) {
      case TokenType.PLUS:
      case TokenType.DASH:
      case TokenType.SLASH:
      case TokenType.STAR: {
        this.eat(); // Consume the operator
        const right = this.expr(this.getBindingPower(op));
        return new BinaryExpr(left, right, op);
      }

      default:
        throw new ParserError();
    }
  }
}
