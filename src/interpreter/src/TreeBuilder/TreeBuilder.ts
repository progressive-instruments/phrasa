

import {ITreeBuilder} from './ITreeBuilder'
import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'

import {PhraseFileParser} from './PhraseFileParser.js'

export class TreeBuilder implements ITreeBuilder {
  private _tree: Tree.PieceTree;


  build(mainPhrase: TextContent, phrases: TextContent[], instruments: TextContent[]) : Tree.PieceTree {
    this._tree = {rootPhrase: {}};
    let fileParser = new PhraseFileParser(mainPhrase,phrases,this._tree.rootPhrase);
    fileParser.parse();
    return this._tree;
  }

}