import { Interpreter } from "./Interpreter";
import {TextPosition} from './PhrasaError'

export interface PieceTree {
  rootSection :Section
}


export interface ValueWithErrorPosition<T> {
  value: T;
  errorPosition: TextPosition;
}

export class Variable {
  name : string;
}

export enum Operator {Add, Subtract, Multiply, Divide}
export class ArithmeticExpression {
  operator : Operator;
  left : ExpressionInput;
  right : ExpressionInput 
}

export class Expression {
  subject: string;
  input: ExpressionInput
}

export type ExpressionInputItem = ((string | Variable | Expression | ArithmeticExpression));  
export type ExpressionInput = ExpressionInputItem[] | ExpressionInputItem;   

export class Pitch {
  grid?: ValueWithErrorPosition<number[]>; // guaranteed to be sorted
  zone?: ValueWithErrorPosition<number>; // frequency
}
export interface Section {
  pitch?: Pitch;
  variables? : ValueWithErrorPosition<Map<string, ExpressionInput>>
  sectionLength? : ValueWithErrorPosition<ExpressionInput>;
  tempo? : ValueWithErrorPosition<ExpressionInput>;
  beat? : ValueWithErrorPosition<boolean>;
  branches? : Map<string,Section>
  sections? : Section[]
  totalSections? : ValueWithErrorPosition<number> // should be expression input. Add another property for default section to be used in tree builder after evaluation
  sequences? : Map<string, Sequence>
  events? : Map<number,SectionEvent>
  defaultInstrument?: ValueWithErrorPosition<string>;
}


export class SequenceTrigger {
  constructor(name: string, steps: number) {
    this.name = name;
    this.steps = steps;
  }
  name: string;
  steps: number;
}

export type EventValue = string | SequenceTrigger;
export type OffsetValue = string | SequenceTrigger;

export interface FrequencyExpression {
  type: 'pitch' | 'frequency' | 'note';
  value: EventValue;
}

export type Sequence = ValueWithErrorPosition<string>[];

export interface SectionEvent {
  instrument?: ValueWithErrorPosition<string>;
  frequency?: ValueWithErrorPosition<FrequencyExpression>;
  values?: Map<string, ValueWithErrorPosition<EventValue>>;
  startOffset?: ValueWithErrorPosition<OffsetValue>;
  endOffset?: ValueWithErrorPosition<OffsetValue>
}