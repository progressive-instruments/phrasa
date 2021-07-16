import { PhrasaError } from "./PhrasaError";
import { PieceTree } from "./PieceTree";
import { Sequence } from "./Sequence";

export interface SequenceBuilderResult {
  sequence: Sequence;
  errors: PhrasaError[];
}

export interface ISequenceBuilder {
  build(tree: PieceTree) : SequenceBuilderResult
}