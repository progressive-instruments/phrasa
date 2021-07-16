

import {ITreeBuilder, TreeBuilderResult} from './ITreeBuilder'
import * as Tree from '../PieceTree.js'
import {TextContent} from '../TextContent'

import {PhraseFileParser} from './PhraseFileParser.js'

export class TreeBuilder implements ITreeBuilder {
  private _tree: Tree.PieceTree;


  build(mainPhrase: TextContent, additionalPhrases: TextContent[], instruments: TextContent[]) : TreeBuilderResult {
    this._tree = {rootSection: {}};
    let fileParser = new PhraseFileParser(mainPhrase,additionalPhrases,this._tree.rootSection);
    const errors = fileParser.parse();
    return {
      tree: this._tree,
      errors: errors
    };
  }

}