
import {PieceTree} from './PieceTree'
import {TextContent} from './TextContent'

export interface ITreeBuilder {
  build(piece: TextContent, motifs: TextContent[], instruments: TextContent[]) : PieceTree;
}