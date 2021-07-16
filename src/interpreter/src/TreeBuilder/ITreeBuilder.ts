
import {PieceTree} from '../PieceTree'
import {TextContent} from '../TextContent'
import {PhrasaError} from '../PhrasaError'

export interface TreeBuilderResult
{
  tree: PieceTree;
  errors: PhrasaError[]
}

export interface ITreeBuilder {
  build(piece: TextContent, motifs: TextContent[], instruments: TextContent[]) : TreeBuilderResult;
}