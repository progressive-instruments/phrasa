import {InputStream, Token, CommonTokenStream, Recognizer} from 'antlr4'
import PhrasaLexer from "../generated-parser/PhrasaLexer.js"
import PhrasaParser from "../generated-parser/PhrasaParser.js"
import Listener from "../generated-parser/PhrasaListener.js"

import { ParseTreeWalker } from 'antlr4/tree/Tree.js'

import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'
import {PhrasaError, TextPosition, TextPositionPoint} from '../PhrasaError'
import { ErrorListener } from 'antlr4/error/ErrorListener.js'

import { PhrasaExpresionTreeBuilder, PhrasaExpressionTreeBuilderResult } from "./PhrasaExpressionTreeBuilder.js";
import { PhrasaExpression, PhrasaExpressionType } from '../PhrasaExpression.js'

class AntlrErrorListener extends ErrorListener {
  constructor(private _errors: PhrasaError[], private _fileName: string) {
    super();
  }
  syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
    this._errors.push({
      description: msg,
      errorPosition: {
        start: {
          line: line,
          column: column
        },
        end: {
          line: line,
          column: column+offendingSymbol.text.length
        },
        fileName: this._fileName
      }
    });
  }
}

export class AntlrPhrasaExpressionTreeBuilder extends Listener implements PhrasaExpresionTreeBuilder {
  private _errors: PhrasaError[];  
  private _expressions: PhrasaExpression[];
  private _expressionStack: PhrasaExpression[][];
  private _fileName: string
  constructor() {
    super();
  }

  build(text: TextContent):  PhrasaExpressionTreeBuilderResult{
    this._errors = [];
    this._fileName = text.name;
    this._expressions = []
    this._expressionStack = [this._expressions];
    const chars = new InputStream(text.readAll());
    let lexer = new PhrasaLexer(chars);
    var errorListener = new AntlrErrorListener(this._errors, text.name);
    
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);
    const stream = new CommonTokenStream(lexer);
    if(this._errors.length > 0) {
      return {errors: this._errors};
    }
    const parser = new PhrasaParser(stream);
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    let main = parser.main();
    if(this._errors.length > 0) {
      return {errors: this._errors};
    }
    let walker = new ParseTreeWalker();
    walker.walk(this,main);
    return {errors: this._errors, expressions: this._expressions};
  }

  enterKey(ctx: PhrasaParser.KeyContext) {
    const text = ctx.getText();
    const textPositions = this.getTextPositionRange(ctx.TEXT()[0].getSymbol());
    const textPosition = {start: textPositions[0], end: textPositions[1], fileName: this._fileName};
    const innerExpressions = [];

    this._expressionStack[this._expressionStack.length-1].push({
      type: PhrasaExpressionType.SubjectExpression, 
      subjectExpression: {
        subject: {value: text, textPosition: textPosition},
        expressions: innerExpressions
      }
    });

    this._expressionStack.push(innerExpressions);
  }

  private getTextPositionRange(token: Token): [TextPositionPoint,TextPositionPoint] {
    return [
      {
        line: token.line,
        column: token.column
      },
      {
        line: token.line,
        column: token.column + token.text.length
      }
    ];
  }

  enterValue(ctx: PhrasaParser.ValueContext) {
    let token: Token;
    let text: string; 
    if(ctx.TEXT()) {
      token = ctx.TEXT().getSymbol()
      text = ctx.TEXT().getText();

    } else {
      let op = ctx.operation();
      token = op.TEXT(0).getSymbol();
      text = op.TEXT(0).getText() + op.OPERATOR().getText() + op.TEXT(1).getText();
    }

    const textPositions = this.getTextPositionRange(ctx.TEXT().getSymbol());
    const textPosition = {start: textPositions[0], end: textPositions[1], fileName: this._fileName};
    this._expressionStack[this._expressionStack.length-1].push({
      type: PhrasaExpressionType.Value,
      value: {value: text, textPosition: textPosition}
    });
  }

  exitNewline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._expressionStack.pop();
  }
  exitInline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._expressionStack.pop();
  }
}