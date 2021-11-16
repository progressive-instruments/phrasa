import { Property, ExpressionSubject, PhrasaSymbol } from "./symbols.js";
import * as Tree from '../PieceTree.js'
import * as ValueEvaluator from '../Evaluator.js'
import _ from 'lodash'
import { PhrasaError, TextPosition } from "../PhrasaError.js";
import { ParsedPhrasaFile } from "./ITreeBuilder.js";
import { isSubjectExpression, PhrasaExpression, PhrasaExpressionType, ValueWithPosition } from "../PhrasaExpression.js";

interface Ref<T> {
  value: T
}

interface ExtendedSection extends Tree.Section {
  defaultInnerSection? : Tree.Section;
}

export interface EvaluationContext {
  templates: Map<string,PhrasaExpression[]>
}

export abstract class ExpressionEvaluator {

  abstract evaluate(expression: PhrasaExpression, context: Ref<EvaluationContext>): PhrasaError[] | void
  evaluateEnd(context: EvaluationContext) {}
}



abstract class ValueExpressionEvaluator extends ExpressionEvaluator {
  evaluate(expression: PhrasaExpression, context: Ref<EvaluationContext>): PhrasaError[] | void {
    if(expression.type != PhrasaExpressionType.Value) {
      return [{description: 'expression not supported', errorPosition: expression?.subjectExpression.subject.textPosition}]
    }
    this.evaluateValue(expression.value, context);
  }
  abstract evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): void;
}

abstract class SubjectExpressionEvaluator extends ExpressionEvaluator {
  evaluate(expression: PhrasaExpression, context: Ref<EvaluationContext>): PhrasaError[] | void {
    if(!isSubjectExpression(expression.type)) {
      return [{description: 'expression not supported', errorPosition: expression.value?.textPosition}]
    }
    this.evaluateSubjectExpression(expression.subjectExpression.subject, expression.subjectExpression.expressions, context);
  }
  abstract evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>): void;
}


function tryEvaluateTemplateExpression(phrasaExpression: PhrasaExpression): ValueWithPosition<string> {
  if(phrasaExpression.type != PhrasaExpressionType.SubjectExpression 
    || phrasaExpression.subjectExpression.subject.value != ExpressionSubject.Use) {
    return null;
  }
  if(phrasaExpression.subjectExpression.expressions.length != 1 || phrasaExpression.subjectExpression.expressions[0].type != PhrasaExpressionType.Value) {
    throw new Error('use expression must include a single value')
  }
  return phrasaExpression.subjectExpression.expressions[0].value;
}

export function doExpressionEvaluation(expressions: PhrasaExpression[], evaluator: ExpressionEvaluator, contextRef: Ref<EvaluationContext>, finalErrors: PhrasaError[])
{
  for(const expression of expressions)  {
    const templateName = tryEvaluateTemplateExpression(expression);
    if(templateName) {
      if(!contextRef.value.templates.has(templateName.value)) { 
        finalErrors.push({description: `template '${templateName.value}' was not found`, errorPosition: templateName.textPosition});
      } else {
        const templateExpressions = contextRef.value.templates.get(templateName.value);
        
        doExpressionEvaluation(templateExpressions,evaluator,contextRef, finalErrors);
      }
    } else {
      try {
        const errors = evaluator.evaluate(expression,contextRef);
        if(errors) {
          finalErrors.push(...errors);
        }
      } catch(e) {
        if(expression.type == PhrasaExpressionType.Value) {
          finalErrors.push({
            errorPosition: expression.value.textPosition,
            description: (e as Error).message
          })
        }
        else {
          finalErrors.push({
            errorPosition: expression.subjectExpression.subject.textPosition,
            description: (e as Error).message
          })
        }
      }
    }
  } 
}

export function evaluate(expressions: PhrasaExpression[], evaluatorOrEvaluators: ExpressionEvaluator | ExpressionEvaluator[], context: EvaluationContext): PhrasaError[] {
  let finalErrors: PhrasaError[] = [];
  const evaluators = Array.isArray(evaluatorOrEvaluators) ? evaluatorOrEvaluators : [evaluatorOrEvaluators];
  for(const evaluator of evaluators) {
    const contextRef: Ref<EvaluationContext> = {value:context};
    doExpressionEvaluation(expressions, evaluator, contextRef, finalErrors);
    evaluator.evaluateEnd(contextRef.value);
  }
  return finalErrors;
}


export class SectionAssigner extends ExpressionEvaluator {
  _innerSectionsExpressions: PhrasaExpression[][];
  _defaultInnerSection?: PhrasaExpression[]

  _branchesExpressions: Map<string,PhrasaExpression[]>;

  constructor(private _section: ExtendedSection) {
    super();
  }

  evaluate(expression: PhrasaExpression, context: Ref<EvaluationContext>): PhrasaError[] | void {
    if(isSubjectExpression(expression.type)) {
      const subject = expression.subjectExpression.subject;
      switch(subject.value) {
        case Property.Pitch:
          if(!this._section.pitch) {
            this._section.pitch = {};
          }
          return evaluate(expression.subjectExpression.expressions, new PitchAssigner(this._section.pitch),context.value);
        case Property.Tempo:
          return evaluate(expression.subjectExpression.expressions, new TempoAssigner(this._section),context.value);
        case Property.Sections:
          if(!this._innerSectionsExpressions) {
            this._innerSectionsExpressions = [];
          }
          if(!this._defaultInnerSection) {
            this._defaultInnerSection = [];
          }
          return evaluate(expression.subjectExpression.expressions, new SectionsAssigner(this._section, this._innerSectionsExpressions, this._defaultInnerSection),context.value);
        case Property.Length:
          return evaluate(expression.subjectExpression.expressions, new LengthAssigner(this._section),context.value);
        case Property.Branches:
          if(!this._branchesExpressions) {
            this._branchesExpressions = new Map<string, PhrasaExpression[]>();
          }
          return evaluate(expression.subjectExpression.expressions, new BranchesAssigner(this._branchesExpressions),context.value);
        case Property.Sequences:
          if(!this._section.sequences) {
            this._section.sequences = new Map<string, Tree.Sequence>();
          }
          return evaluate(expression.subjectExpression.expressions, new SequencesAssigner(this._section.sequences),context.value);
          case Property.Events:
        case Property.Event:
          if(!this._section.events) {
            this._section.events = new Map<number,Tree.SectionEvent>();
          }
          const eventsAssigner = new EventsAssigner(this._section.events);
          let expressions = expression.subjectExpression.expressions;
          if(subject.value == Property.Event) {
            expressions = [{
              type: PhrasaExpressionType.NestedSubjectExpression,
              subjectExpression: {
                subject: {
                  value: '1',
                  textPosition: subject.textPosition,
                },
                expressions: expressions
              }
            }]
          }
          return evaluate(expressions, eventsAssigner,context.value);
        case Property.DefaultInstrument:
          return evaluate(expression.subjectExpression.expressions, new DefaultInstrumentAssigner(this._section),context.value);
        case Property.Templates:
          const newTemplateMap = new Map<string,PhrasaExpression[]>(context.value.templates)
          const errors = evaluate(expression.subjectExpression.expressions, new TemplatesAssigner(newTemplateMap), context.value);
          if(!errors || errors.length == 0) {
            context.value = {templates: newTemplateMap};
          }
          return errors;
        default:
          return [{description: `invalid property ${subject.value}`, errorPosition: subject.textPosition}]
      }
    } else {
      if(expression.value.value == PhrasaSymbol.Beat) {
        this._section.beat = {value: true,errorPosition: expression.value.textPosition};
      } else {
          throw new Error(`invalid value ${expression.value.value}`);
      }
    }
  }

  evaluateEnd(context: EvaluationContext) {
    if(this._innerSectionsExpressions) {
      this._section.sections = new Array(this._innerSectionsExpressions.length);
      for(let i = 0 ; i < this._innerSectionsExpressions.length ; ++i) {
        if(this._innerSectionsExpressions[i].length > 0) {
          this._section.sections[i] = {};
          evaluate(this._innerSectionsExpressions[i], new SectionAssigner(this._section.sections[i]),context)
        }
      }
    }

    if(this._branchesExpressions) {
      this._section.branches = new Map<string, Tree.Section>()
      for(const branchExpression of this._branchesExpressions) {
        const newSection: Tree.Section = {};
        evaluate(branchExpression[1], new SectionAssigner(newSection), context);
        this._section.branches.set(branchExpression[0], newSection);
      }
    }
  }

}

export class DefaultInstrumentAssigner extends ValueExpressionEvaluator {
  constructor(private _section: ExtendedSection){
    super();
  }

  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
      this._section.defaultInstrument = {value: value.value, errorPosition: value.textPosition};
  }
}

class TempoAssigner extends ValueExpressionEvaluator {
  constructor(private _section: ExtendedSection){
    super();
  }
  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
    this._section.tempo = {value: value.value, errorPosition: value.textPosition};
  }
}


class ChordEvaluator extends ValueExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
      this._pitch.grid = {value: ValueEvaluator.evaluate(value.value,[ValueEvaluator.ChordToGrid]), errorPosition: value.textPosition};
  }
}

class ScaleEvaluator extends ValueExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
    this._pitch.grid = {value: ValueEvaluator.evaluate(value.value,[ValueEvaluator.ScaleToGrid]), errorPosition: value.textPosition};
  }
}

class PitchGridAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  evaluate(expression: PhrasaExpression, context: Ref<EvaluationContext>) {
    if(isSubjectExpression(expression.type)) {
      if(expression.subjectExpression.subject.value == ExpressionSubject.Chord) {
        return evaluate(expression.subjectExpression.expressions,new ChordEvaluator(this._pitch),context.value);
      } else if(expression.subjectExpression.subject.value == ExpressionSubject.Scale) {
        return evaluate(expression.subjectExpression.expressions, new ScaleEvaluator(this._pitch),context.value);
      }
    } else {
      this._pitch.grid = {value: ValueEvaluator.evaluate(expression.value.value,[ValueEvaluator.ScaleToGrid]), errorPosition: expression.value.textPosition}
    }
  }
}

class PitchZoneAssigner extends ValueExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }

  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
    this._pitch.zone = {value: ValueEvaluator.evaluate(value.value,[ValueEvaluator.NoteToFrequency]), errorPosition: value.textPosition};
  }
}

class PitchAssigner extends SubjectExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch){
    super();
  }

  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    if(subject.value == Property.PitchGrid) {
      return evaluate(expressions, new PitchGridAssigner(this._pitch),context.value)
    } else if (subject.value == Property.PitchZone) {
      return evaluate(expressions, new PitchZoneAssigner(this._pitch),context.value)
    } else {
      throw new Error('invalid property');
    }
  }

}


class TemplatesAssigner extends SubjectExpressionEvaluator {
  constructor(private _templates: Map<string,PhrasaExpression[]>){
    super();
  }

  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    if(!this._templates.has(subject.value)) {
      this._templates.set(subject.value, expressions);
    } else {
      this._templates.set(subject.value ,expressions.concat(this._templates.get(subject.value))); 
    }
  }

}

function getOrCreate<T,U>(map: Map<T,U> , key: T, defaultValue: ()=>U): U {
  if(!map.has(key)) {
    map.set(key, defaultValue());
  }
  return map.get(key);
}

class SectionsLengthAssigner extends ValueExpressionEvaluator {
  constructor(
    private _parentSection: ExtendedSection, private _sectionsExpressions: PhrasaExpression[][], private _defaultExpressions: PhrasaExpression[]) {
    super();
  }

  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
    const num = ValueEvaluator.evaluate(value.value, [ValueEvaluator.ToUnsignedInteger]);
    while(this._sectionsExpressions.length < num) {
      this._sectionsExpressions.push(this._defaultExpressions.slice())
    }
    this._parentSection.totalSections = {value: num, errorPosition: value.textPosition};
  }


}

class SectionsAssigner extends SubjectExpressionEvaluator {
  constructor(
    private _parentSection: ExtendedSection, private _sectionsExpressions: PhrasaExpression[][], private _defaultExpressions: PhrasaExpression[]) {
    super();
  }

  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    if(subject.value == Property.SectionsTotal) {
      return evaluate(expressions, new SectionsLengthAssigner(this._parentSection, this._sectionsExpressions, this._defaultExpressions),context.value);
    }
    else if(subject.value == Property.SectionsEach) {
      this._defaultExpressions.push(...expressions);
      for(const sectionExpressions of this._sectionsExpressions) {
        sectionExpressions.push(...expressions);
      }
    } else {
      const sectionIndexes = ValueEvaluator.evaluate(subject.value,[ValueEvaluator.OneBasedToZeroBaseRanged]);
      for(const sectionIndex of sectionIndexes) {
        while(this._sectionsExpressions.length <= sectionIndex) {
          this._sectionsExpressions.push(this._defaultExpressions.slice());
        }
        this._sectionsExpressions[sectionIndex].push(...expressions)
      }
    }
    
  }
}

class LengthAssigner extends ValueExpressionEvaluator {
  constructor(private _section: ExtendedSection){
    super();
  }
  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
    this._section.sectionLength = {value:value.value, errorPosition: value.textPosition};
  }
}


class BranchesAssigner extends SubjectExpressionEvaluator {
  constructor(private _branchesExpressions: Map<string,PhrasaExpression[]>) {
    super();
  }
  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    if(!this._branchesExpressions.has(subject.value)) {
      this._branchesExpressions.set(subject.value, expressions);
    } else {
      this._branchesExpressions.get(subject.value).push(...expressions);
    }
  }
}

class SequencesAssigner extends SubjectExpressionEvaluator {
  constructor(private _sequences: Map<string, Tree.Sequence>){
    super();
  }
  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    if(!this._sequences.has(subject.value)) {
      this._sequences.set(subject.value,[]);
    }
    return evaluate(expressions,new SequenceAssigner(this._sequences.get(subject.value)),context.value);
  }
}

class SequenceAssigner extends ValueExpressionEvaluator {
  constructor(private _sequence: Tree.Sequence){
    super();
    _sequence.length = 0; 
  }
  evaluateValue(value: ValueWithPosition<string>, context: Ref<EvaluationContext>): PhrasaError[] | void {
    this._sequence.push({value: value.value, errorPosition: value.textPosition});
  }
}

const StepsExpression = /(^>+$)|(^<+$)/

class EventValueAssigner extends ExpressionEvaluator {
  constructor(
    private _event: Tree.SectionEvent, 
    private _valueKey : string){
    super();
  }

  createSequenceTrigger(expression: PhrasaExpression) {

    let name: ValueWithPosition<string>;
    let steps: number;
    if(expression.type == PhrasaExpressionType.NestedSubjectExpression) {
      name = expression.subjectExpression.subject;
      if(expression.subjectExpression.expressions.length != 1 || 
        expression.subjectExpression.expressions[0].type != PhrasaExpressionType.Value) {
        throw new Error('invalid sequence trigger argument')
      }
      const value = expression.subjectExpression.expressions[0].value;
      let match = value.value.match(StepsExpression)
      if(!match) {
        throw new Error('invalid sequence trigger argument');
      }
      steps = value.value.length;
      if(value.value.startsWith('<')) {
        steps *= -1;
      }

    } else if(expression.type == PhrasaExpressionType.Value) {
      steps = 1;
      name = expression.value
    } else {
      throw new Error('invalid expression');
    }

    return new Tree.SequenceTrigger(name.value, steps);
  }
  
  evaluate(expression: PhrasaExpression, context: Ref<EvaluationContext>) {
    if(expression.type == PhrasaExpressionType.SubjectExpression) {
      const subjectExpression = expression.subjectExpression;
      if(subjectExpression.subject.value == Property.Sequences && subjectExpression.expressions.length == 1 && subjectExpression.expressions[0].type == PhrasaExpressionType.NestedSubjectExpression) {
        this.setValue(this.createSequenceTrigger(subjectExpression.expressions[0]), expression.subjectExpression.subject.textPosition);
      }
    } else if(expression.type == PhrasaExpressionType.Value) {
      this.setValue(expression.value.value, expression.value.textPosition)
    } else {
      throw new Error('invalid property')
    }
  }

  private setValue(value: string | Tree.SequenceTrigger, errorPosition: TextPosition) {
    if(this._valueKey === Property.EventInstrument) {
      if(typeof(value) == 'string') {
        this._event.instrument = {value: value,errorPosition: errorPosition };
      } else {
        throw new Error('instrument value must be a string')
      }
    } else if(this._valueKey === Property.EventStartOffset) {
      this._event.startOffset = {value: value,errorPosition: errorPosition };
    } else if(this._valueKey === Property.EventEndOffset) {
      this._event.endOffset = {value: value,errorPosition: errorPosition };
    } else if(this._valueKey === PhrasaSymbol.PitchEventValue) {
      this._event.pitch = {value: value, errorPosition: errorPosition};
    } else {
      this._event.values.set(this._valueKey, {value:value, errorPosition: errorPosition});
    }
  }
}

class EventAssigner extends SubjectExpressionEvaluator {
  constructor(private event: Tree.SectionEvent){
    super();
  }
  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    return evaluate(expressions , new EventValueAssigner(this.event, subject.value),context.value);
  }
}

class EventsAssigner extends SubjectExpressionEvaluator {
  constructor(private _events: Map<number,Tree.SectionEvent>){
    super();
  }
  evaluateSubjectExpression(subject: ValueWithPosition<string>, expressions: PhrasaExpression[], context: Ref<EvaluationContext>) {
    let index = ValueEvaluator.evaluate(subject.value,[ValueEvaluator.OneBasedToZeroBased]);
    if(index == null) { 
      throw new Error('invalid event key');
    }
    if(!this._events.has(index)) {
      this._events.set(index, {values: new Map<string, Tree.ValueWithErrorPosition<Tree.EventValue>>()});
    }
    return evaluate(expressions , new EventAssigner(this._events.get(index)),context.value);
  }
}
