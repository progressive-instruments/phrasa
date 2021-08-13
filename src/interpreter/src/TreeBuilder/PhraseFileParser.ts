
import {PhrasaSymbol} from './symbols.js'

import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'
import {splitAssignKey, SectionAssigner, ExpressionEvaluator, SelectorAssigner} from './parsers.js'
import {PhrasaError, TextPosition, TextPositionPoint} from '../PhrasaError'
import { ParsedPhrasaFile } from './ITreeBuilder.js'
import { PhrasaExpression, PhrasaExpressionType, ValueWithPosition } from '../PhrasaExpression.js'


export class PhraseFileParser {
  private _errors: PhrasaError[];
  constructor(private _composition: ParsedPhrasaFile, private _templates: ParsedPhrasaFile[], private _outSection: Tree.Section)
  {}

  parse(): PhrasaError[] {
    this._errors = [];
    const initialEvaluator = new SectionAssigner(this._outSection, this._templates);
    this.handleExpressions(this._composition.expressions, initialEvaluator);
    return this._errors;
  }

  private handleExpressions(expressions: PhrasaExpression[], evaluator: ExpressionEvaluator): void {
    for(const expression of expressions) {
      if(expression.type == PhrasaExpressionType.Value) {
        this.setValue(expression.value, evaluator);
      } else if(expression.type == PhrasaExpressionType.SubjectExpression) {
        const newEvaluator = this.getNewEvaluator(expression.subjectExpression.subject, evaluator);
        if(newEvaluator) {
          this.handleExpressions(expression.subjectExpression.expressions, newEvaluator);
        }
      }
    }
    evaluator.assignEnd();
  }

  getNewEvaluator(subject: ValueWithPosition<string>, evaluator: ExpressionEvaluator): ExpressionEvaluator {
    const path = splitAssignKey(subject.value);
    for(let i=0 ; i<path.length; ++i ){
      if(path[i] == PhrasaSymbol.SelectorSymbol) {
        evaluator = new SelectorAssigner(path.slice(i+1),evaluator);
        break;
      }
      try {
        if(i == 0) {
          evaluator = evaluator.getInnerExprEvaulator(path[i])
        } else {
          evaluator = evaluator.getInnerAssigner(path[i])
        }
      } catch(e) {
        const error = e as Error;
        this._errors.push({description: error.message, errorPosition: subject.textPosition});
        return null;
      }
      
    }
    return evaluator;
  }

  setValue(value: ValueWithPosition<string>, evaluator: ExpressionEvaluator) {
    try {
      evaluator.setStringValue(value.value, value.textPosition);
    } catch(e) {
      const err: Error = e;        
      this._errors.push({description: err.message, errorPosition: value.textPosition});
    }
  }

}