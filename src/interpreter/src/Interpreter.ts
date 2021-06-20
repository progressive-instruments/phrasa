import {InputStream, Token, CommonTokenStream, Recognizer} from 'antlr4'
import PhrasaLexer from "./generated-parser/PhrasaLexer"
import PhrasaParser from "./generated-parser/PhrasaParser"
import PhrasaListener from "./generated-parser/PhrasaListener"
import {Sequence} from './Sequence'
import {TextContent} from './TextContent'
import {IInterpreter} from './IInterpreter'
import { TreeBuilder } from './TreeBuilder/TreeBuilder.js'
import { ISequenceBuilder } from './ISequenceBuilder.js'
import { ITreeBuilder } from './TreeBuilder/ITreeBuilder'
import { SequenceBuilder } from './SequenceBuilder.js'
class GetNotesErrorRecognizer {
        syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
            console.error(`lexer/parser error line: ${line} column: ${column} msg: ${msg}`)
            throw new Error('lexer/parser error');
        }
}


export class Interpreter implements IInterpreter {
    private _treeBuilder: ITreeBuilder;
    private _sequenceBuilder: ISequenceBuilder;
    constructor() 
    {
        this._treeBuilder = new TreeBuilder();
        this._sequenceBuilder = new SequenceBuilder();
    }

    parseEvents(piece: TextContent, motifs: TextContent[], instruments: TextContent[]): Sequence {
        let tree = this._treeBuilder.build(piece, motifs, instruments)
        return this._sequenceBuilder.build(tree);
    }

}
