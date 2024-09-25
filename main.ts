import Lexer from "./frontend/lexer.ts"
import {Parser} from "./frontend/parser.ts"



const content = Deno.readTextFileSync('examples/main.to');

const lexer = new Lexer(content);

const tokens = lexer.MakeTokens();

const parser = new Parser(tokens);


const ast = parser.parse()


console.log(ast);