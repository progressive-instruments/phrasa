import { PieceTree } from "./PieceTree";
import { Sequence } from "./Sequence";

export interface ISequenceBuilder {
  build(tree: PieceTree) : Sequence
}