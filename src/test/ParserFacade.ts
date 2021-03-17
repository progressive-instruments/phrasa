import {InputStream, Token, CommonTokenStream, tree} from 'antlr4'
import {NotesLexer} from "../generated-parser/NotesLexer.js"
import {NotesParser} from "../generated-parser/NotesParser.js"
import {NotesListener} from "../generated-parser/NotesListener.js"


export function getNotes(input: string) : string[] {
    const chars = new InputStream(input)
    const lexer = new NotesLexer(chars)
    const stream = new CommonTokenStream(lexer)
    const parser = new NotesParser(stream)

    return parser.main().NOTE().map(t => t.getText())
}

export function getTokens(input: string) : Token[] {
    const chars = new InputStream(input);
    const lexer = new NotesLexer(chars);
    return lexer.getAllTokens();
}
