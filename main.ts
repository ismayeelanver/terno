import { ScopeMaker } from "./frontend/enviroment/env.ts";
import { CompoundStmt } from "./frontend/helper.ts";
import Lexer from "./frontend/lexer.ts"
import {Parser} from "./frontend/parser.ts"



const content = Deno.readTextFileSync('examples/main.to');

const lexer = new Lexer(content);

const tokens = lexer.MakeTokens();

const parser = new Parser(tokens);

const ast = parser.parse();

console.log(JSON.stringify(ast, null, 2));