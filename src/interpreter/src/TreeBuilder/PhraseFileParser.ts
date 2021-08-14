
import {ExpressionSubject, PhrasaSymbol, Property} from './symbols.js'

import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'
import {SectionAssigner, ExpressionEvaluator, SelectorAssigner} from './parsers.js'
import {PhrasaError, TextPosition, TextPositionPoint} from '../PhrasaError'
import { ParsedPhrasaFile } from './ITreeBuilder.js'
import { PhrasaExpression, PhrasaExpressionType, ValueWithPosition } from '../PhrasaExpression.js'

interface PhrasaTemplate {
  name: string;
  expressions: PhrasaExpression[];
}

export class PhraseFileParser {
  private _errors: PhrasaError[];
  constructor(private _composition: ParsedPhrasaFile, private _templates: ParsedPhrasaFile[], private _outSection: Tree.Section)
  {}

  parse(): PhrasaError[] {
    this._errors = [];
    const initialEvaluator = new SectionAssigner(this._outSection, this._templates);
    this.handleExpressions(this._composition.expressions, initialEvaluator, this._templates);
    return this._errors;
  }
  
  private tryEvaluateTemplateExpression(phrasaExpression: PhrasaExpression): ValueWithPosition<string> {
    if(phrasaExpression.type != PhrasaExpressionType.SubjectExpression 
      || phrasaExpression.subjectExpression.subjects.length != 1
      || phrasaExpression.subjectExpression.subjects[0].value != ExpressionSubject.Use) {
      return null;
    }
    if(phrasaExpression.subjectExpression.expressions.length != 1 || phrasaExpression.subjectExpression.expressions[0].type != PhrasaExpressionType.Value) {
      throw new Error('use expression must include a single value')
    }
    return phrasaExpression.subjectExpression.expressions[0].value;
  }

  private handleTemplateExpression(templateName: ValueWithPosition<string>, evaluator: ExpressionEvaluator, templates: PhrasaTemplate[]) {
    const index = templates.findIndex(t => t.name == templateName.value);
    if(index < 0) { 
      this._errors.push({description: 'template index', errorPosition: templateName.textPosition});
      return;
    }
    this.handleExpressions(templates[index].expressions, evaluator, templates.slice(index))
  }

  private handleExpressions(expressions: PhrasaExpression[], evaluator: ExpressionEvaluator, templates: PhrasaTemplate[]): void {
    for(const expression of expressions) {
      const templateName = this.tryEvaluateTemplateExpression(expression);
      if(templateName) {
        this.handleTemplateExpression(templateName, evaluator, templates);
      } else if(expression.type == PhrasaExpressionType.Value) {
        this.setValue(expression.value, evaluator);
      } else if(expression.type == PhrasaExpressionType.SubjectExpression) {
        const newEvaluator = this.getNewEvaluator(expression.subjectExpression.subjects, evaluator);
        if(newEvaluator) {
          this.handleExpressions(expression.subjectExpression.expressions, newEvaluator, templates);
        }
      }
    }
    evaluator.assignEnd();
  }

  getNewEvaluator(subjects: ValueWithPosition<string>[], evaluator: ExpressionEvaluator): ExpressionEvaluator {
    for(let i=0 ; i<subjects.length; ++i ){
      if(subjects[i].value == PhrasaSymbol.SelectorSymbol) {
        evaluator = new SelectorAssigner(subjects.slice(i+1).map(s => s.value),evaluator);
        break;
      }
      try {
        if(i == 0) {
          evaluator = evaluator.getInnerExprEvaulator(subjects[i].value)
        } else {
          evaluator = evaluator.getInnerAssigner(subjects[i].value)
        }
      } catch(e) {
        const error = e as Error;
        this._errors.push({description: error.message, errorPosition: subjects[i].textPosition});
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