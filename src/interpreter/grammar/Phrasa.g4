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

object: ( NEWLINE
    |   key 
        (space_or_tab+ value space_or_tab* NEWLINE
    |   space_or_tab* NEWLINE INDENT object DEDENT
    |   space_or_tab* NEWLINE (((START_ARRAY_OBJ_ITEM object) | (START_ARRAY_VAL_ITEM value space_or_tab* NEWLINE)) DEDENT)+ ))+;


key:    key ('.' key)+
    |   '~'? WORD
    |   signed_integer;


value:  
        value space_or_tab+ operator space_or_tab+ value
    |   number
    |   reference
    |   func
    |   inline_array
    |   inline_object
    |   text
    ;

text: (WORD | INTEGER | '.' | '#')+;

reference : inner_reference | EXTERNAL_REFERENCE;

inner_reference: ('.' key?)+ ;

func: '(' WORD (space_or_tab+ value (space_or_tab* ',' space_or_tab* value )*)? space_or_tab* ')';

inline_object: '{' space_or_tab* inline_object_pair (space_or_tab* ',' space_or_tab* inline_object_pair)* space_or_tab* '}';
inline_object_pair: key space_or_tab+ value;

inline_array: '[' space_or_tab* ( value (space_or_tab* ',' space_or_tab* value)* space_or_tab*)? ']';

number: signed_integer
    |   fraction
    |   float_number;

float_number: signed_integer '.' INTEGER;
fraction: signed_integer '/' signed_integer;
signed_integer: ('-' | '+')? INTEGER;
operator: '-' | '+' | 'X' |'x' | '/';
space_or_tab: ' ' | '\t';

COMMENT: '//' ~[\n\r]+ -> skip;

WORD: [a-zA-Z]+;
INTEGER: [0-9]+;

EXTERNAL_REFERENCE: '<' (~'>')+ '>';


NEWLINE: '\r'? '\n' ' '* {
    let spaces = this.text.length - (this.text.indexOf('\n')+1);
    let currentIndentation = spaces / 2;
    if(currentIndentation == this.indentationLevel + 1) {
        this.tokenQueue.push(new antlr4.CommonToken(this._tokenFactorySourcePair, CosoParser.INDENT, antlr4.Lexer.DEFAULT_TOKEN_CHANNEL, this.getCharIndex()-1, this.getCharIndex()-1));
    }
    else if(currentIndentation < this.indentationLevel) {
        for(let i = 0 ; i < this.indentationLevel - currentIndentation ; ++i) {
            this.tokenQueue.push(new antlr4.CommonToken(this._tokenFactorySourcePair, CosoParser.DEDENT, antlr4.Lexer.DEFAULT_TOKEN_CHANNEL, this.getCharIndex()-1, this.getCharIndex()-1));
        }
    }
    this.indentationLevel = currentIndentation;
};

START_ARRAY_OBJ_ITEM: '* ' {
    this.indentationLevel = this.indentationLevel + 1
};

START_ARRAY_VAL_ITEM: '- ' {
    this.indentationLevel = this.indentationLevel + 1
};