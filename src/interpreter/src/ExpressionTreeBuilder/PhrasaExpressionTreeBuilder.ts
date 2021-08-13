import { TextPosition, PhrasaError, TextPositionPoint } from "../PhrasaError";
import { PhrasaExpression } from "../PhrasaExpression";
import { TextContent } from "../TextContent";


export interface PhrasaExpressionTreeBuilderResult {
  expressions?: PhrasaExpression[]
  errors: PhrasaError[]
}

export interface PhrasaExpresionTreeBuilder{ 
  build(text: TextContent): PhrasaExpressionTreeBuilderResult;
} 