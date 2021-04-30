import {TerminalNode} from 'antlr4/tree/Tree'
import Lexer from './PhrasaLexer'

declare class PhrasaParser {
    constructor(input: any);
    _interp: any;
    ruleNames: any;
    literalNames: any;
    symbolicNames: any;
    get atn(): any;
    main(): MainContext;
    state: number;
    newline_expr_ins(): Newline_expr_insContext;
    newline_expr_in(): Newline_expr_inContext;
    newline_expr(): Newline_exprContext;
    key(): KeyContext;
    inline_expr_ins(): Inline_expr_insContext;
    inline_expr_in(): Inline_expr_inContext;
    value(): ValueContext;
    operation(): OperationContext;
    inline_expr(): Inline_exprContext;
}
declare namespace PhrasaParser {
    export const EOF: any;
    export const T__0: number;
    export const T__1: number;
    export const T__2: number;
    export const T__3: number;
    export const COMMENT: number;
    export const OPERATOR: number;
    export const TEXT: number;
    export const NEWLINE: number;
    export const IN_ROW_SPACES: number;
    export const INDENT: number;
    export const DEDENT: number;
    export const RULE_main: number;
    export const RULE_newline_expr_ins: number;
    export const RULE_newline_expr_in: number;
    export const RULE_newline_expr: number;
    export const RULE_key: number;
    export const RULE_inline_expr_ins: number;
    export const RULE_inline_expr_in: number;
    export const RULE_value: number;
    export const RULE_operation: number;
    export const RULE_inline_expr: number;
    export { MainContext };
    export { Newline_expr_insContext };
    export { Newline_expr_inContext };
    export { Newline_exprContext };
    export { KeyContext };
    export { Inline_expr_insContext };
    export { Inline_expr_inContext };
    export { ValueContext };
    export { OperationContext };
    export { Inline_exprContext };
}
export default PhrasaParser;
declare class MainContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    newline_expr_ins(): Newline_expr_insContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class Newline_expr_insContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    newline_expr_in(): Newline_expr_inContext[];
    newline_expr_in(i: number): Newline_expr_inContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class Newline_expr_inContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    newline_expr(): Newline_exprContext;
    inline_expr_in(): Inline_expr_inContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class Newline_exprContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    key(): KeyContext;
    inline_expr_ins(): Inline_expr_insContext;
    NEWLINE(): any;
    INDENT(): any;
    newline_expr_ins(): Newline_expr_insContext;
    DEDENT(): any;
    EOF(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class KeyContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    TEXT(): TerminalNode;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class Inline_expr_insContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    inline_expr_in(): Inline_expr_inContext[];
    inline_expr_in(i: number): Inline_expr_inContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class Inline_expr_inContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    value(): ValueContext;
    inline_expr(): Inline_exprContext;
    inline_expr_ins(): Inline_expr_insContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class ValueContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    TEXT(): TerminalNode;
    operation(): OperationContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class OperationContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    OPERATOR(): TerminalNode;
    TEXT(): TerminalNode[];
    TEXT(i: number): TerminalNode;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare class Inline_exprContext {
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    key(): KeyContext;
    inline_expr_ins(): Inline_expr_insContext;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
