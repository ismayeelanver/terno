import Lexer from "./frontend/lexer.ts"
import {Parser} from "./frontend/parser.ts"


const lexer: Lexer = new Lexer("2 + 2 / 2");

const tokens = lexer.MakeTokens();

const parser = new Parser(tokens);

const ast = parser.parse()

console.log(ast.evaluate());