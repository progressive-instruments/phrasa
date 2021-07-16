import { Interpreter } from "./Interpreter";
import {TextPositionRange} from './PhrasaError'

export interface PieceTree {
  rootSection :Section
}


export interface ValueWithTextPosition<T> {
  value: T;
  textPosition: TextPositionRange;
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
  grid?: ValueWithTextPosition<number[]>; // guaranteed to be sorted
  zone?: ValueWithTextPosition<number>; // frequency
}
export interface Section {
  pitch?: Pitch;
  variables? : ValueWithTextPosition<Map<string, ExpressionInput>>
  sectionLength? : ValueWithTextPosition<ExpressionInput>;
  tempo? : ValueWithTextPosition<ExpressionInput>;
  beat? : ValueWithTextPosition<boolean>;
  branches? : Map<string,Section>
  sections? : Section[]
  totalSections? : ValueWithTextPosition<number> // should be expression input. Add another property for default section to be used in tree builder after evaluation
  sequences? : Map<string, Sequence>
  events? : Map<number,SectionEvent>
  defaultInstrument?: ValueWithTextPosition<string>;
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

export type Sequence = ValueWithTextPosition<string>[];

export interface SectionEvent {
  instrument?: ValueWithTextPosition<string>;
  frequency?: ValueWithTextPosition<FrequencyExpression>;
  values?: Map<string, ValueWithTextPosition<EventValue>>;
  startOffset?: ValueWithTextPosition<OffsetValue>;
  endOffset?: ValueWithTextPosition<OffsetValue>
}