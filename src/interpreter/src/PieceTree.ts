import { Interpreter } from "./Interpreter";

export interface PieceTree {
  rootSection :Section
}
  
export interface TextLocation {
  __line? :number;
  __columnStart? : number;
  __columnEnd? : number;
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

export type ExpressionInputItem = ((string | Variable | Expression | ArithmeticExpression) & TextLocation);  
export type ExpressionInput = ExpressionInputItem[] | ExpressionInputItem;   

export class Pitch {
  grid?: number[]; // guaranteed to be sorted
  zone?: number; // frequency
}
export interface Section {
  pitch?: Pitch;
  variables? : Map<string, ExpressionInput>
  sectionLength? : ExpressionInput;
  tempo? : ExpressionInput;
  beat? : boolean;
  branches? : Map<string,Section>
  sections? : Section[]
  totalSections? : number // should be expression input. Add another property for default section to be used in tree builder after evaluation
  sequences? : Map<string, Sequence>
  events? : Map<number,SectionEvent>
  defaultInstrument?: string;
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

export type Sequence = string[];

export interface SectionEvent {
  instrument?: string;
  frequency?: FrequencyExpression;
  values?: Map<string, EventValue>
  startOffset?: OffsetValue
  endOffset?: OffsetValue
}