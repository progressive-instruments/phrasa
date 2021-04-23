import {InputStream, Token, CommonTokenStream, tree, Recognizer} from 'antlr4'
import PhrasaLexer from "../generated-parser/PhrasaLexer.js"
import PhrasaParser from "../generated-parser/PhrasaParser.js"
import {PhrasaListener} from "../generated-parser/PhrasaListener.js"

class GetNotesErrorRecognizer {
        syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
            console.error(`lexer/parser error line: ${line} column: ${column} msg: ${msg}`)
            throw new Error('lexer/parser error');
        }
}
export class PhrasaInterpreter {
    // define interpreter interface
}

