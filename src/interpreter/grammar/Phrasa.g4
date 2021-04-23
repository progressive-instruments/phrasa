grammar Phrasa;

tokens {
	INDENT,
    DEDENT
}

@lexer::header {
    import PhrasaParser from './PhrasaParser.js';
}

@lexer::members {
    this.indentationLevel = 0;
    this.tokenQueue = [];
    this.nextToken = () => {
        let tk = {};
        if(this.tokenQueue.length > 0) {
            tk = this.tokenQueue.shift();
        } else {
            tk = super.nextToken();
        }
        return tk;
    }
}

main: object;

object: (NEWLINE | declaration (NEWLINE | EOF))+;

declaration: 
    (key (value | NEWLINE INDENT object (DEDENT | EOF)))
    |   value;

key: TEXT ('.' TEXT)*;

value: TEXT;

COMMENT: '//' ~[\n\r]+ -> skip;
TEXT: [a-zA-Z0-9_-]+;

NEWLINE: '\r'? '\n' ' '* {
    let spaces = this.text.length - (this.text.indexOf('\n')+1);
    let currentIndentation = spaces / 2;
    if(currentIndentation == this.indentationLevel + 1) {
        this.tokenQueue.push(new antlr4.CommonToken(this._tokenFactorySourcePair, PhrasaParser.INDENT, antlr4.Lexer.DEFAULT_TOKEN_CHANNEL, this.getCharIndex()-1, this.getCharIndex()-1));
    }
    else if(currentIndentation < this.indentationLevel) {
        for(let i = 0 ; i < this.indentationLevel - currentIndentation ; ++i) {
            this.tokenQueue.push(new antlr4.CommonToken(this._tokenFactorySourcePair, PhrasaParser.DEDENT, antlr4.Lexer.DEFAULT_TOKEN_CHANNEL, this.getCharIndex()-1, this.getCharIndex()-1));
        }
    }
    this.indentationLevel = currentIndentation;
};

IN_ROW_SPACES: [ \t]+->skip;