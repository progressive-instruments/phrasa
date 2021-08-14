import { TextPosition } from "./PhrasaError";

export interface ValueWithPosition<T> {
  value: T;
  textPosition: TextPosition
}

export enum PhrasaExpressionType {
  Value,
  SubjectExpression
}

export interface PhrasaExpression {
  type: PhrasaExpressionType,
  subjectExpression?: PhrasaSubjectExpression,
  value?: ValueWithPosition<string>;
}

export interface PhrasaSubjectExpression {
  subjects: ValueWithPosition<string>[];
  expressions: PhrasaExpression[]
}