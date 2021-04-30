import {ParseTreeListener} from 'antlr4/tree/Tree'
import Parser from './PhrasaParser'

export default class PhrasaListener extends ParseTreeListener {
    enterMain(ctx: Parser.MainContext): void;
    exitMain(ctx: Parser.MainContext): void;
    enterNewline_expr_ins(ctx: Parser.Newline_expr_insContext): void;
    exitNewline_expr_ins(ctx: Parser.Newline_expr_insContext): void;
    enterNewline_expr_in(ctx: Parser.Newline_expr_inContext): void;
    exitNewline_expr_in(ctx: Parser.Newline_expr_inContext): void;
    enterNewline_expr(ctx: Parser.Newline_exprContext): void;
    exitNewline_expr(ctx: Parser.Newline_exprContext): void;
    enterKey(ctx: Parser.KeyContext): void;
    exitKey(ctx: Parser.KeyContext): void;
    enterInline_expr_ins(ctx: Parser.Inline_expr_insContext): void;
    exitInline_expr_ins(ctx: Parser.Inline_expr_insContext): void;
    enterInline_expr_in(ctx: Parser.Inline_expr_inContext): void;
    exitInline_expr_in(ctx: Parser.Inline_expr_inContext): void;
    enterValue(ctx: Parser.ValueContext): void;
    exitValue(ctx: Parser.ValueContext): void;
    enterOperation(ctx: Parser.OperationContext): void;
    exitOperation(ctx: Parser.OperationContext): void;
    enterInline_expr(ctx: Parser.Inline_exprContext): void;
    exitInline_expr(ctx: Parser.Inline_exprContext): void;
}
