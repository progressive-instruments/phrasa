function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Generated from grammar/Phrasa.g4 by ANTLR 4.9.2
// jshint ignore: start
import antlr4 from 'antlr4';
import PhrasaParser from './PhrasaParser.js';
const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786", "\u5964\u0002\n8\b\u0001\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004", "\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t", "\u0007\u0004\b\t\b\u0004\t\t\t\u0003\u0002\u0003\u0002\u0003\u0003\u0003", "\u0003\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005\u0003\u0006\u0003", "\u0006\u0003\u0006\u0003\u0006\u0006\u0006 \n\u0006\r\u0006\u000e\u0006", "!\u0003\u0006\u0003\u0006\u0003\u0007\u0003\u0007\u0003\b\u0006\b)\n", "\b\r\b\u000e\b*\u0003\t\u0005\t.\n\t\u0003\t\u0003\t\u0007\t2\n\t\f", "\t\u000e\t5\u000b\t\u0003\t\u0003\t\u0002\u0002\n\u0003\u0003\u0005", "\u0004\u0007\u0005\t\u0006\u000b\u0007\r\b\u000f\t\u0011\n\u0003\u0002", "\u0005\u0004\u0002\f\f\u000f\u000f\u0005\u0002,-//11\u0007\u0002\f\f", "\u000f\u000f\"\"*+..\u0002;\u0002\u0003\u0003\u0002\u0002\u0002\u0002", "\u0005\u0003\u0002\u0002\u0002\u0002\u0007\u0003\u0002\u0002\u0002\u0002", "\t\u0003\u0002\u0002\u0002\u0002\u000b\u0003\u0002\u0002\u0002\u0002", "\r\u0003\u0002\u0002\u0002\u0002\u000f\u0003\u0002\u0002\u0002\u0002", "\u0011\u0003\u0002\u0002\u0002\u0003\u0013\u0003\u0002\u0002\u0002\u0005", "\u0015\u0003\u0002\u0002\u0002\u0007\u0017\u0003\u0002\u0002\u0002\t", "\u0019\u0003\u0002\u0002\u0002\u000b\u001b\u0003\u0002\u0002\u0002\r", "%\u0003\u0002\u0002\u0002\u000f(\u0003\u0002\u0002\u0002\u0011-\u0003", "\u0002\u0002\u0002\u0013\u0014\u0007\"\u0002\u0002\u0014\u0004\u0003", "\u0002\u0002\u0002\u0015\u0016\u0007.\u0002\u0002\u0016\u0006\u0003", "\u0002\u0002\u0002\u0017\u0018\u0007*\u0002\u0002\u0018\b\u0003\u0002", "\u0002\u0002\u0019\u001a\u0007+\u0002\u0002\u001a\n\u0003\u0002\u0002", "\u0002\u001b\u001c\u00071\u0002\u0002\u001c\u001d\u00071\u0002\u0002", "\u001d\u001f\u0003\u0002\u0002\u0002\u001e \n\u0002\u0002\u0002\u001f", "\u001e\u0003\u0002\u0002\u0002 !\u0003\u0002\u0002\u0002!\u001f\u0003", "\u0002\u0002\u0002!\"\u0003\u0002\u0002\u0002\"#\u0003\u0002\u0002\u0002", "#$\b\u0006\u0002\u0002$\f\u0003\u0002\u0002\u0002%&\t\u0003\u0002\u0002", "&\u000e\u0003\u0002\u0002\u0002\')\n\u0004\u0002\u0002(\'\u0003\u0002", "\u0002\u0002)*\u0003\u0002\u0002\u0002*(\u0003\u0002\u0002\u0002*+\u0003", "\u0002\u0002\u0002+\u0010\u0003\u0002\u0002\u0002,.\u0007\u000f\u0002", "\u0002-,\u0003\u0002\u0002\u0002-.\u0003\u0002\u0002\u0002./\u0003\u0002", "\u0002\u0002/3\u0007\f\u0002\u000202\u0007\"\u0002\u000210\u0003\u0002", "\u0002\u000225\u0003\u0002\u0002\u000231\u0003\u0002\u0002\u000234\u0003", "\u0002\u0002\u000246\u0003\u0002\u0002\u000253\u0003\u0002\u0002\u0002", "67\b\t\u0003\u00027\u0012\u0003\u0002\u0002\u0002\u0007\u0002!*-3\u0004", "\b\u0002\u0002\u0003\t\u0002"].join("");
const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);
const decisionsToDFA = atn.decisionToState.map((ds, index) => new antlr4.dfa.DFA(ds, index));
export default class PhrasaLexer extends antlr4.Lexer {
  constructor(input) {
    super(input);
    this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    this.indentationLevel = 0;
    this.tokenQueue = [];

    this.nextToken = () => {
      let tk = {};

      if (this.tokenQueue.length > 0) {
        tk = this.tokenQueue.shift();
      } else {
        tk = super.nextToken();
      }

      return tk;
    };
  }

  get atn() {
    return atn;
  }

}

_defineProperty(PhrasaLexer, "grammarFileName", "Phrasa.g4");

_defineProperty(PhrasaLexer, "channelNames", ["DEFAULT_TOKEN_CHANNEL", "HIDDEN"]);

_defineProperty(PhrasaLexer, "modeNames", ["DEFAULT_MODE"]);

_defineProperty(PhrasaLexer, "literalNames", [null, "' '", "','", "'('", "')'"]);

_defineProperty(PhrasaLexer, "symbolicNames", [null, null, null, null, null, "COMMENT", "OPERATOR", "TEXT", "NEWLINE"]);

_defineProperty(PhrasaLexer, "ruleNames", ["T__0", "T__1", "T__2", "T__3", "COMMENT", "OPERATOR", "TEXT", "NEWLINE"]);

PhrasaLexer.EOF = antlr4.Token.EOF;
PhrasaLexer.T__0 = 1;
PhrasaLexer.T__1 = 2;
PhrasaLexer.T__2 = 3;
PhrasaLexer.T__3 = 4;
PhrasaLexer.COMMENT = 5;
PhrasaLexer.OPERATOR = 6;
PhrasaLexer.TEXT = 7;
PhrasaLexer.NEWLINE = 8;

PhrasaLexer.prototype.action = function (localctx, ruleIndex, actionIndex) {
  switch (ruleIndex) {
    case 7:
      this.NEWLINE_action(localctx, actionIndex);
      break;

    default:
      throw "No registered action for:" + ruleIndex;
  }
};

PhrasaLexer.prototype.NEWLINE_action = function (localctx, actionIndex) {
  switch (actionIndex) {
    case 0:
      let spaces = this.text.length - (this.text.indexOf('\n') + 1);
      let currentIndentation = spaces / 2;

      if (currentIndentation == this.indentationLevel + 1) {
        this.tokenQueue.push(new antlr4.CommonToken(this._tokenFactorySourcePair, PhrasaParser.INDENT, antlr4.Lexer.DEFAULT_TOKEN_CHANNEL, this.getCharIndex() - 1, this.getCharIndex() - 1));
      } else if (currentIndentation < this.indentationLevel) {
        for (let i = 0; i < this.indentationLevel - currentIndentation; ++i) {
          this.tokenQueue.push(new antlr4.CommonToken(this._tokenFactorySourcePair, PhrasaParser.DEDENT, antlr4.Lexer.DEFAULT_TOKEN_CHANNEL, this.getCharIndex() - 1, this.getCharIndex() - 1));
        }
      }

      this.indentationLevel = currentIndentation;
      break;

    default:
      throw "No registered action for:" + actionIndex;
  }
};