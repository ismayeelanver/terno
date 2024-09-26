import { BinaryExpr, CompoundStmt, Expr, FunctionStmt, Param, type, VariableStmt } from "../helper.ts";

export interface Scope {
    parent?: Array<Scope>;
    body?: Array<Scope>;
}

export class MakeScope implements Scope {
    constructor(public parent: Array<Scope>, public body: Array<Scope>) {
    }
}

export class ScopeMaker {
    global: Scope[];
    constructor(public bodystmt: CompoundStmt) {
        this.global = [];
    }

    HandleExpr(expr: Expr) {
        switch(expr.type) {
            case "BinaryExression": {
                let value = expr as BinaryExpr;
                
            }
        }
    }

    make() {
        for (
            let stmtcount = 0;
            stmtcount < this.bodystmt.body.length;
            stmtcount++
        ) {
            switch (this.bodystmt.body.at(stmtcount)?.type) {
                case "Variable": {
                    const variable = this.bodystmt.body.at(
                        stmtcount,
                    ) as VariableStmt;
                    const decl = new VariableScope(
                        variable.name,
                        variable.value,
                        variable.is_const,
                        variable.Type,
                    );
                    this.global.push(decl);
                    break;
                }
                case "Compound": {
                    const scope = this.bodystmt.body.at(stmtcount);
                    const madeScope = new ScopeMaker(scope as CompoundStmt);
                    madeScope.make();
                    const decl = {
                        parent: this.global,
                        body: madeScope.global,
                    } as Scope;
                    this.global.push(decl);
                    break;
                }
                case "Function": {
                    const scope = this.bodystmt.body.at(stmtcount) as FunctionStmt;
                    const madeScope = new ScopeMaker(scope.body);
                    madeScope.make()
                    const decl = new FunctionScope(scope.name, scope.param, scope.Type, madeScope.global, this.global);
                    this.global.push(decl as Scope);
                    break
                }
                case "Expr": {

                }
            }

        }
    }
}

export class VariableScope implements Scope {
    body?: Scope[] | undefined;
    constructor(
        public name: string,
        public value: Expr,
        public isConst: boolean,
        public Type: type,
    ) {
        this.body = [];
    }
}

export class FunctionScope implements Scope {
    constructor(
        public name: string,
        public parameters: Param,
        public Type: type,
        public body: Scope[],
        public parent: Scope[]
    ) {}
}
