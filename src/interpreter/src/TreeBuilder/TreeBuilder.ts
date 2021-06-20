import {InputStream, Token, CommonTokenStream, Recognizer} from 'antlr4'
import PhrasaLexer from "../generated-parser/PhrasaLexer.js"
import PhrasaParser from "../generated-parser/PhrasaParser.js"
import Listener from "../generated-parser/PhrasaListener.js"

import {ITreeBuilder} from './ITreeBuilder'
import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'
import { ParseTreeWalker } from 'antlr4/src/antlr4/tree/Tree.js'
import {PhrasaSymbol,Property,KeyPrefixes} from './symbols.js'
import {splitAssignKey, PhraseAssigner, ExpressionEvaluator, SelectorAssigner} from './parsers.js'



class GetNotesErrorRecognizer {
  syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
      console.error(`lexer/parser error line: ${line} column: ${column} msg: ${msg}`)
      throw new Error('lexer/parser error');
  }
}


export class TreeBuilder extends Listener implements ITreeBuilder {
  private _tree: Tree.PieceTree;
  private _exprEvaluatorsStack: ExpressionEvaluator[];


  build(piece: TextContent, motifs: TextContent[], instruments: TextContent[]) : Tree.PieceTree {
    this._tree = {rootPhrase: {}};
    this._exprEvaluatorsStack = [new PhraseAssigner(this._tree.rootPhrase)];
    const chars = new InputStream(piece.readAll());
    let lexer = new PhrasaLexer(chars);
    const stream = new CommonTokenStream(lexer);
    const parser = new PhrasaParser(stream);
    let main = parser.main();
    let walker = new ParseTreeWalker();
    walker.walk(this,main);

    return this._tree;
  }

  enterKey(ctx: PhrasaParser.KeyContext) {
      let key = ctx.TEXT();
      let newEvaluator = this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1];
      let text = ctx.getText();
      const path = splitAssignKey(text);
      for(let i=0 ; i<path.length; ++i ){
        if(path[i] == PhrasaSymbol.SelectorSymbol) {
          newEvaluator = new SelectorAssigner(path.slice(i+1),newEvaluator);
          break;
        }
        if(i == 0){ 
          newEvaluator = newEvaluator.getInnerExprEvaulator(path[i])
        } else {
          newEvaluator = newEvaluator.getInnerAssigner(path[i])
        }
      }
      this._exprEvaluatorsStack.push(newEvaluator);
  }


  enterValue(ctx: PhrasaParser.ValueContext) {
    let assigner = this._exprEvaluatorsStack[this._exprEvaluatorsStack.length-1];
    if(ctx.TEXT()) {
      let text = ctx.TEXT().getText();
      assigner.setStringValue(text);
    } else{
      let op = ctx.operation();
      assigner.setStringValue(op.TEXT(0).getText() + op.OPERATOR().getText() + op.TEXT(1).getText());
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