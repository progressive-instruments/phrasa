import { TextPosition } from "./PhrasaError";

export interface ValueWithPosition<T> {
  value: T;
  textPosition: TextPosition
}

export enum PhrasaExpressionType {
  Value,
  SubjectExpression,
  NestedSubjectExpression
}

export interface PhrasaExpression {
  type: PhrasaExpressionType,
  subjectExpression?: PhrasaSubjectExpression,
  value?: ValueWithPosition<string>;
}

export interface PhrasaSubjectExpression {
  subject: ValueWithPosition<string>;
  expressions: PhrasaExpression[]
}
