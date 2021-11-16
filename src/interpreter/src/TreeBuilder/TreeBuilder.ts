

import {ITreeBuilder, ParsedPhrasaFile, TreeBuilderResult} from './ITreeBuilder'
import * as Tree from '../PieceTree.js'
import {ExpressionSubject, PhrasaSymbol, Property} from './symbols.js'
import {SectionAssigner, Sequence, evaluate} from './parsers.js'
import {PhrasaError, TextPosition, TextPositionPoint} from '../PhrasaError'
import { PhrasaExpression, PhrasaExpressionType, PhrasaSubjectExpression, ValueWithPosition } from '../PhrasaExpression.js'


export class TreeBuilder implements ITreeBuilder {

  build(composition: ParsedPhrasaFile, templates: ParsedPhrasaFile[]) : TreeBuilderResult {
    let tree: Tree.PieceTree = {rootSection: {}};
    const initialEvaluator = new SectionAssigner(tree.rootSection);
    const templatesMap = new Map(templates?.map(t => [t.name, t.expressions]) ?? []);

    const errors = evaluate(composition.expressions, initialEvaluator, {templates: templatesMap, sequences: new Map<string,Sequence>()});
    return {
      tree: tree,
      errors: errors
    };
  }
  

}