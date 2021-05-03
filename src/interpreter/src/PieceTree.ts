import { Interpreter } from "./Interpreter";

export interface PieceTree {
  rootPhrase :Phrase
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
export interface PitchGrid {
  root: number; // frequency
  octaveGrid: number[] // array of 0-11
}

export class Pitch {
  grid: PitchGrid[];
  zone: number; // frequency
}
export interface Phrase {
  pitch?: Pitch;
  variables? : Map<string, ExpressionInput>
  length? : ExpressionInput;
  tempo? : ExpressionInput;
  beat? : boolean;
  branches? : Map<string,Phrase>
  phrases? : Phrase[]
  sequences? : Map<string, Sequence>
  events? : Map<string,PhraseEvent>
}

export type Sequence = ExpressionInput;
export interface PhraseEvent {
  values: Map<string, EventPropertyValue>
  startOffset?: ExpressionInput
  endOffset?: ExpressionInput
}
export type EventPropertyValue = ExpressionInput;