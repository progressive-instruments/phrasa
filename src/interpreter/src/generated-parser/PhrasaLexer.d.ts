import {Lexer, Token} from 'antlr4'

declare class PhrasaLexer extends Lexer {
    constructor(input: any);
    _interp: any;
    indentationLevel: number;
    tokenQueue: any[];
    nextToken(): Token;
    get atn(): any;
    action(localctx: any, ruleIndex: any, actionIndex: any): void;
    NEWLINE_action(localctx: any, actionIndex: any): void;
}
declare namespace PhrasaLexer {
    const EOF: any;
    const T__0: number;
    const T__1: number;
    const T__2: number;
    const T__3: number;
    const COMMENT: number;
    const OPERATOR: number;
    const TEXT: number;
    const NEWLINE: number;
    const IN_ROW_SPACES: number;
}
export default PhrasaLexer;
