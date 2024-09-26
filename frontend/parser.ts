import { Token, TokenType } from "./lexer.ts";
import {
  ArrayType,
  BinaryExpr,
  CompoundStmt,
  CustomType,
  EmptyStmt,
  Expr,
  ExprStmt,
  FunctionStmt,
  ImplicitType,
  NumericExpr,
  Param,
  ParenthesizedExpr,
  ParserError,
  ReturnStmt,
  Stmt,
  StringExpr,
  type,
  UndefinedExpr,
  VariableStmt,
} from "./helper.ts";

enum Bp {
  LOWEST = 0,
  MULTIPLICATIVE = 10,
  ADDITIVE = 20,
  XOR = 30,
  XAND = 40,
  EQUALITY = 50,
  LOGICAL_AND = 60,
  LOGICAL_OR = 70,
  ASSIGNMENT = 60,
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
      throw new ParserError(
        `Expected ${expected}, found ${this.currentToken.type}`,
      );
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
      case TokenType.PLUS_EQUALS:
      case TokenType.MINUS_EQUALS:
      case TokenType.EQUALS:
        return Bp.ASSIGNMENT
      case TokenType.EQUALS_EQUALS:
      case TokenType.BANG_EQUALS:
        return Bp.EQUALITY
      case TokenType.BIT_OR:
        return Bp.XOR
      case TokenType.BIT_AND:
        return Bp.XAND
      case TokenType.AND:
        return Bp.LOGICAL_AND
      case TokenType.OR:
        return Bp.LOGICAL_OR
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
    } else if (this.currentToken.type === TokenType.SEMI) {
      this.advance();
      return new EmptyStmt();
    } else if (this.currentToken.type === TokenType.LCB) {
      this.advance();
      return this.bodyStmt();
    } else if (this.currentToken.type === TokenType.K_DEF) {
      this.advance()
      return this.functionDecl();
    } else if (this.currentToken.type === TokenType.K_RETURN) {
      this.advance();
      const return_stmt =  new ReturnStmt(this.expr(Bp.LOWEST));
      this.consume(TokenType.SEMI);
      return return_stmt;
    }
    return this.stmt();
  }

  bodyStmt() {
    const body = new CompoundStmt([]);
    while (this.currentToken.type != TokenType.RCB) {
      body.body.push(this.program());
    }

    if (this.currentToken.type != TokenType.RCB) {
      throw new ParserError(`Expected }`);
    }
    this.advance();

    return body;
  }

  compare(left: any, right: any) {
    return left == right;
  }

  Type(): type {
    switch (this.currentToken.type) {
      case TokenType.LSB: { // Array Type
        this.advance(); // Consume '['
        const elementType = this.Type();
        this.consume(TokenType.RSB); // Expect ']'
        return new ArrayType(elementType);
      }
      case TokenType.IDENTIFIER: { // Custom Type
        const typeName = this.currentToken.value ?? "";
        this.advance(); // Consume the type name (identifier)
        return new CustomType(typeName);
      }
      default: {
        throw new ParserError(`Unknown Type: ${this.currentToken.type}`);
      }
    }
  }

  variableDecl(isConst: boolean): Stmt {
    const name = this.currentToken.value;
    this.consume(TokenType.IDENTIFIER);

    let type: type = new ImplicitType();
    let value: Expr = new UndefinedExpr();

    // Type annotation (optional)
    if (this.currentToken.type == TokenType.COLON) {
      this.advance(); // Consume ':'
      type = this.Type();
    }

    // Variable initialization (optional)
    if (this.currentToken.type == TokenType.EQUALS) {
      this.advance(); // Consume '='
      value = this.expr(Bp.LOWEST);
    }

    this.consume(TokenType.SEMI); // Expect ';' to end the statement
    return new VariableStmt(name ?? "", value, isConst, type);
  }

  parameters(): Param {
    const parameters = new Param();
    while (this.currentToken.type != TokenType.RPAREN) {
      const param_name = this.currentToken.value;
      this.consume(TokenType.IDENTIFIER);
      this.consume(TokenType.COLON);
      const param_type = this.Type();

      parameters.add(param_type, param_name ?? '');
    }

    this.consume(TokenType.RPAREN);
    return parameters;
  }

  functionDecl(): Stmt {
    const name = this.currentToken.value;
    this.consume(TokenType.IDENTIFIER);

    this.consume(TokenType.LPAREN);
    const parameters = this.parameters();
    let type = new ImplicitType();
    if (this.currentToken.type == TokenType.COLON) {
      this.advance();
      type = this.Type();
    }

    this.consume(TokenType.LCB)

    const body = this.bodyStmt();

    return new FunctionStmt(name ?? '', parameters, type, body)
  }

  stmt(): Stmt {
    const expression = this.expr(Bp.LOWEST);
    this.consume(TokenType.SEMI);
    return new ExprStmt(expression);
  }

  nud(): Expr {
    switch (this.currentToken.type) {
      // deno-lint-ignore no-case-declarations
      case TokenType.LPAREN: // Parenthesized expression
        this.advance(); // Consume '('
        const expr = this.expr(Bp.LOWEST);
        this.consume(TokenType.RPAREN); // Expect ')'
        return new ParenthesizedExpr(expr);

      // deno-lint-ignore no-case-declarations
      case TokenType.IDENTIFIER: // Identifiers
        const exprIdent = new StringExpr(this.currentToken.value ?? "");
        this.advance(); // Consume identifier
        return exprIdent;

      // deno-lint-ignore no-case-declarations
      case TokenType.NUMBER: // Numeric literals
        const value = parseInt(this.currentToken.value ?? "");
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
