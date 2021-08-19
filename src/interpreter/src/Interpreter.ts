import {TextContent} from './TextContent'
import {IInterpreter, InterpreterResult} from './IInterpreter'
import { TreeBuilder } from './TreeBuilder/TreeBuilder.js'
import { ISequenceBuilder } from './ISequenceBuilder.js'
import { ITreeBuilder, ParsedPhrasaFile } from './TreeBuilder/ITreeBuilder'
import { SequenceBuilder } from './SequenceBuilder.js'
import { AntlrPhrasaExpressionTreeBuilder } from './ExpressionTreeBuilder/AntlrPhrasaExpressionTreeBuilder.js'
import { PhrasaExpresionTreeBuilder } from './ExpressionTreeBuilder/PhrasaExpressionTreeBuilder.js'
import { PhrasaExpression } from './PhrasaExpression'
import { PhrasaError } from './PhrasaError'





export class Interpreter implements IInterpreter {
    private _treeBuilder: ITreeBuilder;
    private _sequenceBuilder: ISequenceBuilder;
    private _phrasaExpressonBuilder: PhrasaExpresionTreeBuilder;
    constructor() 
    {
        this._treeBuilder = new TreeBuilder();
        this._sequenceBuilder = new SequenceBuilder();
        this._phrasaExpressonBuilder = new AntlrPhrasaExpressionTreeBuilder();
    }

    parseEvents(composition: TextContent, templates: TextContent[], instruments: TextContent[]): InterpreterResult {
        const expressionBuilderRes = this._phrasaExpressonBuilder.build(composition);
        if(expressionBuilderRes.errors && expressionBuilderRes.errors.length > 0) {
            return {
                sequence: null,
                errors: expressionBuilderRes.errors
            }
        }
        const parsedCompositionFile: ParsedPhrasaFile = {name: composition.name, expressions: expressionBuilderRes.expressions};
        let parsedTemplateFiles: ParsedPhrasaFile[] = [];
        let parsedFilesErrors: PhrasaError[] = [];
        if(templates) {
            for(const template of templates) {
                const templateBuilderRes = this._phrasaExpressonBuilder.build(composition);
                if(templateBuilderRes.errors && templateBuilderRes.errors.length > 0) {
                    parsedFilesErrors.push(...templateBuilderRes.errors);
                } else {
                    parsedTemplateFiles.push({name: template.name , expressions: templateBuilderRes.expressions});
                }
            }
        }
        

        let treeBuilderRes = this._treeBuilder.build(parsedCompositionFile, parsedTemplateFiles);
        if(treeBuilderRes.errors && treeBuilderRes.errors.length > 0) {
            
            return {
                sequence: null,
                errors: parsedFilesErrors.concat(treeBuilderRes.errors)
            };
        }

        const sequenceBuilderRes = this._sequenceBuilder.build(treeBuilderRes.tree);
        if(sequenceBuilderRes.errors && sequenceBuilderRes.errors.length > 0) {
            return {
                sequence: null,
                errors: parsedFilesErrors.concat(sequenceBuilderRes.errors)
            };
        }
        return {
            sequence: sequenceBuilderRes.sequence,
            errors: parsedFilesErrors
        }
    }

}
