import {InputStream, Token, CommonTokenStream, Recognizer} from 'antlr4'
import PhrasaLexer from "../generated-parser/PhrasaLexer.js"
import PhrasaParser from "../generated-parser/PhrasaParser.js"
import Listener from "../generated-parser/PhrasaListener.js"

import { ParseTreeWalker } from 'antlr4/tree/Tree.js'
import {PhrasaSymbol} from './symbols.js'

import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'
import {splitAssignKey, SectionAssigner, ExpressionEvaluator, SelectorAssigner} from './parsers.js'
import {PhrasaError, TextPositionRange} from '../PhrasaError'
import { ErrorListener } from 'antlr4/error/ErrorListener.js'

class GetNotesErrorRecognizer {
  syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
      console.error(`lexer/parser error line: ${line} column: ${column} msg: ${msg}`)
      throw new Error('lexer/parser error');
  }
}

class AntlrErrorListener extends ErrorListener {
  constructor(private _errors: PhrasaError[]) {
    super();
  }
  syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
    this._errors.push({
      description: msg,
      textPosition: {
        start: {
          line: line,
          column: column
        },
        end: {
          line: line,
          column: column+offendingSymbol.text.length
        }
      }
    });
  }
}

export class PhraseFileParser extends Listener {
  private _exprEvaluatorsStack: ExpressionEvaluator[];
  private _errors: PhrasaError[];
  constructor(private _phraseFile:TextContent, private _additionalPhraseFiles: TextContent[], private _outSection: Tree.Section)
  {
    super();
  }

  parse(): PhrasaError[] {
    this._errors = [];
    this._exprEvaluatorsStack = [new SectionAssigner(this._outSection, this._additionalPhraseFiles)];
    const chars = new InputStream(this._phraseFile.readAll());
    let lexer = new PhrasaLexer(chars);
    var errorListener = new AntlrErrorListener(this._errors);
    
    lexer.removeErrorListeners();
    lexer.addErrorListener(errorListener);
    const stream = new CommonTokenStream(lexer);
    if(this._errors.length > 0) {
      return this._errors;
    }
    const parser = new PhrasaParser(stream);
    parser.removeErrorListeners();
    parser.addErrorListener(errorListener);
    let main = parser.main();
    if(this._errors.length > 0) {
      return this._errors;
    }
    let walker = new ParseTreeWalker();
    walker.walk(this,main);
    return this._errors;
  }

  private createError(e: Error, token: Token): PhrasaError{ 
    return {
      description: e.message,
      textPosition: {
        start: {
          line: token.line,
          column: token.column
        },
        end: {
          line: token.line,
          column: token.column + token.text.length
        }
      }
    }
  }
  enterKey(ctx: PhrasaParser.KeyContext) {
    let newEvaluator = this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1];
    let text = ctx.getText();
    const path = splitAssignKey(text);
    for(let i=0 ; i<path.length; ++i ){
      if(path[i] == PhrasaSymbol.SelectorSymbol) {
        newEvaluator = new SelectorAssigner(path.slice(i+1),newEvaluator);
        break;
      }
      try {
        if(i == 0) {
          newEvaluator = newEvaluator.getInnerExprEvaulator(path[i])
        } else {
          newEvaluator = newEvaluator.getInnerAssigner(path[i])
        }
      } catch(e) {
        let token = ctx.TEXT()[0].getSymbol();
        this._errors.push(this.createError(e, token));
        return;
      }
      
    }
    this._exprEvaluatorsStack.push(newEvaluator);
  }

  private getTextPosition(token: Token): TextPositionRange {
    return {
      start: {
        line: token.line,
        column: token.column
      },
      end: {
        line: token.line,
        column: token.column + token.text.length
      }
    };
  }

  enterValue(ctx: PhrasaParser.ValueContext) {
    let assigner = this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1];
    const token = ctx.TEXT().getSymbol();
    if(ctx.TEXT()) {
      const textPosition = this.getTextPosition(ctx.TEXT().getSymbol());
      let text = ctx.TEXT().getText();
      try {
        assigner.setStringValue(text, textPosition);
      } catch(e) {
        const err: Error = e;        
        this._errors.push({description: e.message, textPosition: textPosition});
      }
    } else{
      let op = ctx.operation();
      const textPosition = this.getTextPosition(op.TEXT(0).getSymbol());
      try {
        assigner.setStringValue(op.TEXT(0).getText() + op.OPERATOR().getText() + op.TEXT(1).getText(), textPosition);
      } catch(e) {
        const err: Error = e;        
        this._errors.push({description: e.message, textPosition: textPosition});
      }
    }
  }

  exitNewline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1].assignEnd()
    this._exprEvaluatorsStack.pop();
  }
  exitInline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1].assignEnd()
    this._exprEvaluatorsStack.pop();
  }
}