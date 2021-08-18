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
import { PhrasaExpression, PhrasaExpressionType, PhrasaSubjectExpression, ValueWithPosition } from '../PhrasaExpression.js'
import { KeyPrefixes, PhrasaSymbol, Property } from '../TreeBuilder/symbols.js'

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

function splitWithTextPosition(str: string, spacer: string, textPosition: TextPosition): ValueWithPosition<string>[] {
  let res: ValueWithPosition<string>[] = [];
  const textPosStart =textPosition.start; 
  let currentPos = 0;
  const splitted = str.split(spacer);
  for(const current of splitted) {
    res.push({
      value: current,
      textPosition: {
        start: {line: textPosStart.line, column: textPosStart.column + currentPos},
        end: {line: textPosStart.line, column: textPosStart.column + currentPos + current.length},
        fileName: textPosition.fileName
      }
    })
    currentPos += spacer.length + current.length;
  }
  return res;
}

interface SplittedKeys {
  preSelectorKeys: ValueWithPosition<string>[]
  postSelectorKeys: ValueWithPosition<string>[]
}

const EventsPostifxRegex = /(.+)~([1-9]\d*)?$/;
function splitAssignKey(path: string,textPosition: TextPosition) : SplittedKeys {
  let res: SplittedKeys = {
    preSelectorKeys: [],
    postSelectorKeys: null
  };
  let currentKeys = res.preSelectorKeys;
  for(let keyWithPos of splitWithTextPosition(path, '.', textPosition)) {
      if(keyWithPos.value == PhrasaSymbol.SelectorSymbol) {
        if(currentKeys == res.postSelectorKeys) {
          throw new Error('selector symbol is allowed only once');
        }
        res.postSelectorKeys = [];
        currentKeys = res.postSelectorKeys;
      } else {
        let prefix = keyWithPos.value.charAt(0);
        if(KeyPrefixes.has(keyWithPos.value.charAt(0))) {
          keyWithPos.value = keyWithPos.value.slice(1);
          currentKeys.push({textPosition: keyWithPos.textPosition, value:KeyPrefixes.get(prefix)});
        }
  
        currentKeys.push(keyWithPos);
  
        let postfixMatch = keyWithPos.value.match(EventsPostifxRegex);
        if(postfixMatch) {
          res[currentKeys.length-1].value = postfixMatch[1];
          if(postfixMatch[2]) {
            currentKeys.push({value: Property.Events, textPosition: keyWithPos.textPosition})
            currentKeys.push({value: postfixMatch[2], textPosition: keyWithPos.textPosition});
          } else {
            currentKeys.push({value: Property.Event, textPosition: keyWithPos.textPosition});
          }
        }
      }
    }
    return res;
}

interface Mode {
  currentExpressions: PhrasaExpression[]
  selectorKeys: ValueWithPosition<string>[]
}

export class AntlrPhrasaExpressionTreeBuilder extends Listener implements PhrasaExpresionTreeBuilder {
  private _errors: PhrasaError[];  
  private _expressions: PhrasaExpression[];
  private _fileName: string
  private _modeStack: Mode[];

  constructor() {
    super();
  }

  build(text: TextContent):  PhrasaExpressionTreeBuilderResult{
    this._errors = [];
    this._fileName = text.name;
    this._expressions = []
    this._modeStack = [{currentExpressions: this._expressions, selectorKeys: null}]
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

  
  createNestedSubjectExpression(subjects: ValueWithPosition<string>[]): {head: PhrasaSubjectExpression, tail: PhrasaSubjectExpression} {
    const head: PhrasaSubjectExpression = {
      subject: subjects[0],
      expressions: []
    };
    let tail = head;
    for(let i = 1 ; i < subjects.length; ++i) {
      const newSubjectExpression = {
        subject: subjects[i],
        expressions: []
      }
      tail.expressions.push({
        type: PhrasaExpressionType.NestedSubjectExpression,
        subjectExpression: newSubjectExpression
      })
      tail = newSubjectExpression;
    }
    return {head: head, tail: tail};
  }


  enterKey(ctx: PhrasaParser.KeyContext) {
    const text = ctx.getText();
    const textPositions = this.getTextPositionRange(ctx.TEXT()[0].getSymbol());
    const textPosition = {start: textPositions[0], end: textPositions[1], fileName: this._fileName};
    let keys = splitAssignKey(text, textPosition);
    const currentMode = this._modeStack[this._modeStack.length-1];
    if(currentMode.selectorKeys) {
      keys.preSelectorKeys.push(...currentMode.selectorKeys);
    }
    let nextExpressions = currentMode.currentExpressions;
    if(keys.preSelectorKeys.length > 0) {
      const nestedSubjectExpression = this.createNestedSubjectExpression(keys.preSelectorKeys);
      currentMode.currentExpressions.push({
        type: PhrasaExpressionType.SubjectExpression, 
        subjectExpression: nestedSubjectExpression.head
      });
      nextExpressions = nestedSubjectExpression.tail.expressions;
    }

    this._modeStack.push({currentExpressions: nextExpressions, selectorKeys: keys.postSelectorKeys});
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
    this._modeStack[this._modeStack.length-1].currentExpressions.push({
      type: PhrasaExpressionType.Value,
      value: {value: text, textPosition: textPosition}
    });
  }

  exitNewline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._modeStack.pop();
  }
  exitInline_expr(ctx: PhrasaParser.Newline_exprContext) {
    this._modeStack.pop();
  }
}