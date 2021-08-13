
import {PieceTree} from '../PieceTree'
import {TextContent} from '../TextContent'
import {PhrasaError} from '../PhrasaError'
import { PhrasaExpression } from '../PhrasaExpression'

export interface TreeBuilderResult
{
  tree: PieceTree;
  errors: PhrasaError[]
}

export interface ParsedPhrasaFile {
  name: string;
  expressions: PhrasaExpression[];
}

export interface ITreeBuilder {
  build(composition: ParsedPhrasaFile, templates: ParsedPhrasaFile[]) : TreeBuilderResult;
}