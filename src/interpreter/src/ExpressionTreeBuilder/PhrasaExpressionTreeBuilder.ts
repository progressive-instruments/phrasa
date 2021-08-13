import { TextPosition, PhrasaError, TextPositionPoint } from "../PhrasaError";
import { TextContent } from "../TextContent";

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
  subject: ValueWithPosition<string>;
  expressions: PhrasaExpression[]
}

export interface PhrasaExpressionTreeBuilderResult {
  expressions?: PhrasaExpression[]
  errors: PhrasaError[]
}

export interface PhrasaExpresionTreeBuilder{ 
  build(text: TextContent): PhrasaExpressionTreeBuilderResult;
} 