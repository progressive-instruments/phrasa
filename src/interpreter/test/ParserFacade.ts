import {InputStream, Token, CommonTokenStream, tree, Recognizer} from 'antlr4'
import {NotesLexer} from "../generated-parser/NotesLexer.js"
import {NotesParser} from "../generated-parser/NotesParser.js"
import {NotesListener} from "../generated-parser/NotesListener.js"

class GetNotesErrorRecognizer {
        syntaxError(recognizer: Recognizer, offendingSymbol: Token, line: number, column: number, msg: string, e: any): void {
            console.error(`lexer/parser error line: ${line} column: ${column} msg: ${msg}`)
            throw new Error('lexer/parser error');
        }
}

export function getNotes(input: string) : string[] {
    console.log('stream')
    const chars = new InputStream(input)
    console.log('lexer')
    let lexer = new NotesLexer(chars)
    let lexerRecognizer = (lexer as Recognizer);
    lexerRecognizer.addErrorListener(new GetNotesErrorRecognizer())
    console.log('tokens')
    const stream = new CommonTokenStream(lexer)
    console.log('parser')
    const parser = new NotesParser(stream)
    let parserRecognizer = (parser as Recognizer);
    parserRecognizer.addErrorListener(new GetNotesErrorRecognizer())
    console.log('map')
    let notes = parser.main().NOTE().map(t => t.getText())
    console.log('got notes')
    return notes;
}

export function getTokens(input: string) : Token[] {
    const chars = new InputStream(input);
    const lexer = new NotesLexer(chars);
    return lexer.getAllTokens();
}
