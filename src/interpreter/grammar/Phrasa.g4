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

main: newline_expr_ins;

newline_expr_ins: (' '* NEWLINE | newline_expr_in)+;

newline_expr_in: 
    newline_expr
    | inline_expr_in (NEWLINE | EOF);

newline_expr: key (' '* NEWLINE INDENT newline_expr_ins (DEDENT | EOF)  | ' '+ inline_expr_ins  (EOF | NEWLINE));

key: (TEXT | ',')+;

inline_expr_ins: inline_expr_in ' '* (',' ' '* inline_expr_in ' '*)*;

inline_expr_in: 
    value
    | inline_expr
    | '(' ' '* inline_expr_ins ' '* ')';

value: 
    TEXT | operation;
    
operation:  TEXT OPERATOR TEXT;
inline_expr: '(' ' '* key ' '+  inline_expr_ins ' '* ')';

COMMENT: '//' ~[\n\r]+ -> skip;
OPERATOR: [*/+-];
TEXT: ~[ )(,\n\r]+;

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