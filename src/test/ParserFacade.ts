import {InputStream, Token} from 'antlr4/index'
import {NotesLexer} from "../generated-parser/NotesLexer.js"
import {NotesParser} from "../generated-parser/NotesParser.js"
import {NotesVisitor} from "../generated-parser/NotesVisitor.js"

class NotesSequenceVisitor extends NotesVisitor
{

}

export function getTokens(input: String) : Token[] {
    const chars = new InputStream(input);
    const lexer = new NotesLexer(chars);
    const parser = new NotesParser(lexer);
    lexer.strictMode = false;
    return lexer;
}
