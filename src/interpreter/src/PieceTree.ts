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
  events? : Map<number,SectionEvent>
  defaultInstrument?: ValueWithErrorPosition<string>;
}



export type EventValue = string;
export type OffsetValue = string;


export interface SectionEvent {
  instrument?: ValueWithErrorPosition<string>;
  pitch?: ValueWithErrorPosition<EventValue>;
  values?: Map<string, ValueWithErrorPosition<EventValue>>;
  startOffset?: ValueWithErrorPosition<OffsetValue>;
  endOffset?: ValueWithErrorPosition<OffsetValue>
}