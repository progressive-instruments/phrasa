

import {ITreeBuilder} from './ITreeBuilder'
import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'

import {PhraseFileParser} from './PhraseFileParser.js'

export class TreeBuilder implements ITreeBuilder {
  private _tree: Tree.PieceTree;


  build(mainPhrase: TextContent, additionalPhrases: TextContent[], instruments: TextContent[]) : Tree.PieceTree {
    this._tree = {rootSection: {}};
    let fileParser = new PhraseFileParser(mainPhrase,additionalPhrases,this._tree.rootSection);
    fileParser.parse();
    return this._tree;
  }

}