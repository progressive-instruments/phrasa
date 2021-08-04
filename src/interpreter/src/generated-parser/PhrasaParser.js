function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Generated from grammar/Phrasa.g4 by ANTLR 4.9.2
// jshint ignore: start
import antlr4 from 'antlr4';
import PhrasaListener from './PhrasaListener.js';
const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786", "\u5964\u0003\f\u0092\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004", "\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007", "\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0003\u0002", "\u0003\u0002\u0003\u0003\u0007\u0003\u001a\n\u0003\f\u0003\u000e\u0003", "\u001d\u000b\u0003\u0003\u0003\u0003\u0003\u0006\u0003!\n\u0003\r\u0003", "\u000e\u0003\"\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0005", "\u0004)\n\u0004\u0003\u0005\u0003\u0005\u0007\u0005-\n\u0005\f\u0005", "\u000e\u00050\u000b\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003", "\u0005\u0003\u0005\u0003\u0005\u0006\u00058\n\u0005\r\u0005\u000e\u0005", "9\u0003\u0005\u0003\u0005\u0003\u0005\u0005\u0005?\n\u0005\u0003\u0006", "\u0006\u0006B\n\u0006\r\u0006\u000e\u0006C\u0003\u0007\u0003\u0007\u0007", "\u0007H\n\u0007\f\u0007\u000e\u0007K\u000b\u0007\u0003\u0007\u0003\u0007", "\u0007\u0007O\n\u0007\f\u0007\u000e\u0007R\u000b\u0007\u0003\u0007\u0003", "\u0007\u0007\u0007V\n\u0007\f\u0007\u000e\u0007Y\u000b\u0007\u0007\u0007", "[\n\u0007\f\u0007\u000e\u0007^\u000b\u0007\u0003\b\u0003\b\u0003\b\u0003", "\b\u0007\bd\n\b\f\b\u000e\bg\u000b\b\u0003\b\u0003\b\u0007\bk\n\b\f", "\b\u000e\bn\u000b\b\u0003\b\u0003\b\u0005\br\n\b\u0003\t\u0003\t\u0005", "\tv\n\t\u0003\n\u0003\n\u0003\n\u0003\n\u0003\u000b\u0003\u000b\u0007", "\u000b~\n\u000b\f\u000b\u000e\u000b\u0081\u000b\u000b\u0003\u000b\u0003", "\u000b\u0006\u000b\u0085\n\u000b\r\u000b\u000e\u000b\u0086\u0003\u000b", "\u0003\u000b\u0007\u000b\u008b\n\u000b\f\u000b\u000e\u000b\u008e\u000b", "\u000b\u0003\u000b\u0003\u000b\u0003\u000b\u0002\u0002\f\u0002\u0004", "\u0006\b\n\f\u000e\u0010\u0012\u0014\u0002\u0005\u0003\u0003\n\n\u0003", "\u0003\f\f\u0004\u0002\u0004\u0004\t\t\u0002\u009b\u0002\u0016\u0003", "\u0002\u0002\u0002\u0004 \u0003\u0002\u0002\u0002\u0006(\u0003\u0002", "\u0002\u0002\b*\u0003\u0002\u0002\u0002\nA\u0003\u0002\u0002\u0002\f", "E\u0003\u0002\u0002\u0002\u000eq\u0003\u0002\u0002\u0002\u0010u\u0003", "\u0002\u0002\u0002\u0012w\u0003\u0002\u0002\u0002\u0014{\u0003\u0002", "\u0002\u0002\u0016\u0017\u0005\u0004\u0003\u0002\u0017\u0003\u0003\u0002", "\u0002\u0002\u0018\u001a\u0007\u0003\u0002\u0002\u0019\u0018\u0003\u0002", "\u0002\u0002\u001a\u001d\u0003\u0002\u0002\u0002\u001b\u0019\u0003\u0002", "\u0002\u0002\u001b\u001c\u0003\u0002\u0002\u0002\u001c\u001e\u0003\u0002", "\u0002\u0002\u001d\u001b\u0003\u0002\u0002\u0002\u001e!\u0007\n\u0002", "\u0002\u001f!\u0005\u0006\u0004\u0002 \u001b\u0003\u0002\u0002\u0002", " \u001f\u0003\u0002\u0002\u0002!\"\u0003\u0002\u0002\u0002\" \u0003", "\u0002\u0002\u0002\"#\u0003\u0002\u0002\u0002#\u0005\u0003\u0002\u0002", "\u0002$)\u0005\b\u0005\u0002%&\u0005\u000e\b\u0002&\'\t\u0002\u0002", "\u0002\')\u0003\u0002\u0002\u0002($\u0003\u0002\u0002\u0002(%\u0003", "\u0002\u0002\u0002)\u0007\u0003\u0002\u0002\u0002*>\u0005\n\u0006\u0002", "+-\u0007\u0003\u0002\u0002,+\u0003\u0002\u0002\u0002-0\u0003\u0002\u0002", "\u0002.,\u0003\u0002\u0002\u0002./\u0003\u0002\u0002\u0002/1\u0003\u0002", "\u0002\u00020.\u0003\u0002\u0002\u000212\u0007\n\u0002\u000223\u0007", "\u000b\u0002\u000234\u0005\u0004\u0003\u000245\t\u0003\u0002\u00025", "?\u0003\u0002\u0002\u000268\u0007\u0003\u0002\u000276\u0003\u0002\u0002", "\u000289\u0003\u0002\u0002\u000297\u0003\u0002\u0002\u00029:\u0003\u0002", "\u0002\u0002:;\u0003\u0002\u0002\u0002;<\u0005\f\u0007\u0002<=\t\u0002", "\u0002\u0002=?\u0003\u0002\u0002\u0002>.\u0003\u0002\u0002\u0002>7\u0003", "\u0002\u0002\u0002?\t\u0003\u0002\u0002\u0002@B\t\u0004\u0002\u0002", "A@\u0003\u0002\u0002\u0002BC\u0003\u0002\u0002\u0002CA\u0003\u0002\u0002", "\u0002CD\u0003\u0002\u0002\u0002D\u000b\u0003\u0002\u0002\u0002EI\u0005", "\u000e\b\u0002FH\u0007\u0003\u0002\u0002GF\u0003\u0002\u0002\u0002H", "K\u0003\u0002\u0002\u0002IG\u0003\u0002\u0002\u0002IJ\u0003\u0002\u0002", "\u0002J\\\u0003\u0002\u0002\u0002KI\u0003\u0002\u0002\u0002LP\u0007", "\u0004\u0002\u0002MO\u0007\u0003\u0002\u0002NM\u0003\u0002\u0002\u0002", "OR\u0003\u0002\u0002\u0002PN\u0003\u0002\u0002\u0002PQ\u0003\u0002\u0002", "\u0002QS\u0003\u0002\u0002\u0002RP\u0003\u0002\u0002\u0002SW\u0005\u000e", "\b\u0002TV\u0007\u0003\u0002\u0002UT\u0003\u0002\u0002\u0002VY\u0003", "\u0002\u0002\u0002WU\u0003\u0002\u0002\u0002WX\u0003\u0002\u0002\u0002", "X[\u0003\u0002\u0002\u0002YW\u0003\u0002\u0002\u0002ZL\u0003\u0002\u0002", "\u0002[^\u0003\u0002\u0002\u0002\\Z\u0003\u0002\u0002\u0002\\]\u0003", "\u0002\u0002\u0002]\r\u0003\u0002\u0002\u0002^\\\u0003\u0002\u0002\u0002", "_r\u0005\u0010\t\u0002`r\u0005\u0014\u000b\u0002ae\u0007\u0005\u0002", "\u0002bd\u0007\u0003\u0002\u0002cb\u0003\u0002\u0002\u0002dg\u0003\u0002", "\u0002\u0002ec\u0003\u0002\u0002\u0002ef\u0003\u0002\u0002\u0002fh\u0003", "\u0002\u0002\u0002ge\u0003\u0002\u0002\u0002hl\u0005\f\u0007\u0002i", "k\u0007\u0003\u0002\u0002ji\u0003\u0002\u0002\u0002kn\u0003\u0002\u0002", "\u0002lj\u0003\u0002\u0002\u0002lm\u0003\u0002\u0002\u0002mo\u0003\u0002", "\u0002\u0002nl\u0003\u0002\u0002\u0002op\u0007\u0006\u0002\u0002pr\u0003", "\u0002\u0002\u0002q_\u0003\u0002\u0002\u0002q`\u0003\u0002\u0002\u0002", "qa\u0003\u0002\u0002\u0002r\u000f\u0003\u0002\u0002\u0002sv\u0007\t", "\u0002\u0002tv\u0005\u0012\n\u0002us\u0003\u0002\u0002\u0002ut\u0003", "\u0002\u0002\u0002v\u0011\u0003\u0002\u0002\u0002wx\u0007\t\u0002\u0002", "xy\u0007\b\u0002\u0002yz\u0007\t\u0002\u0002z\u0013\u0003\u0002\u0002", "\u0002{\u007f\u0007\u0005\u0002\u0002|~\u0007\u0003\u0002\u0002}|\u0003", "\u0002\u0002\u0002~\u0081\u0003\u0002\u0002\u0002\u007f}\u0003\u0002", "\u0002\u0002\u007f\u0080\u0003\u0002\u0002\u0002\u0080\u0082\u0003\u0002", "\u0002\u0002\u0081\u007f\u0003\u0002\u0002\u0002\u0082\u0084\u0005\n", "\u0006\u0002\u0083\u0085\u0007\u0003\u0002\u0002\u0084\u0083\u0003\u0002", "\u0002\u0002\u0085\u0086\u0003\u0002\u0002\u0002\u0086\u0084\u0003\u0002", "\u0002\u0002\u0086\u0087\u0003\u0002\u0002\u0002\u0087\u0088\u0003\u0002", "\u0002\u0002\u0088\u008c\u0005\f\u0007\u0002\u0089\u008b\u0007\u0003", "\u0002\u0002\u008a\u0089\u0003\u0002\u0002\u0002\u008b\u008e\u0003\u0002", "\u0002\u0002\u008c\u008a\u0003\u0002\u0002\u0002\u008c\u008d\u0003\u0002", "\u0002\u0002\u008d\u008f\u0003\u0002\u0002\u0002\u008e\u008c\u0003\u0002", "\u0002\u0002\u008f\u0090\u0007\u0006\u0002\u0002\u0090\u0015\u0003\u0002", "\u0002\u0002\u0015\u001b \"(.9>CIPW\\elqu\u007f\u0086\u008c"].join("");
const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);
const decisionsToDFA = atn.decisionToState.map((ds, index) => new antlr4.dfa.DFA(ds, index));
const sharedContextCache = new antlr4.PredictionContextCache();
export default class PhrasaParser extends antlr4.Parser {
  constructor(input) {
    super(input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = PhrasaParser.ruleNames;
    this.literalNames = PhrasaParser.literalNames;
    this.symbolicNames = PhrasaParser.symbolicNames;
  }

  get atn() {
    return atn;
  }

  main() {
    let localctx = new MainContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, PhrasaParser.RULE_main);

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 20;
      this.newline_expr_ins();
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  newline_expr_ins() {
    let localctx = new Newline_expr_insContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, PhrasaParser.RULE_newline_expr_ins);
    var _la = 0; // Token type

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 30;

      this._errHandler.sync(this);

      _la = this._input.LA(1);

      do {
        this.state = 30;

        this._errHandler.sync(this);

        switch (this._input.LA(1)) {
          case PhrasaParser.T__0:
          case PhrasaParser.NEWLINE:
            this.state = 25;

            this._errHandler.sync(this);

            _la = this._input.LA(1);

            while (_la === PhrasaParser.T__0) {
              this.state = 22;
              this.match(PhrasaParser.T__0);
              this.state = 27;

              this._errHandler.sync(this);

              _la = this._input.LA(1);
            }

            this.state = 28;
            this.match(PhrasaParser.NEWLINE);
            break;

          case PhrasaParser.T__1:
          case PhrasaParser.T__2:
          case PhrasaParser.TEXT:
            this.state = 29;
            this.newline_expr_in();
            break;

          default:
            throw new antlr4.error.NoViableAltException(this);
        }

        this.state = 32;

        this._errHandler.sync(this);

        _la = this._input.LA(1);
      } while ((_la & ~0x1f) == 0 && (1 << _la & (1 << PhrasaParser.T__0 | 1 << PhrasaParser.T__1 | 1 << PhrasaParser.T__2 | 1 << PhrasaParser.TEXT | 1 << PhrasaParser.NEWLINE)) !== 0);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  newline_expr_in() {
    let localctx = new Newline_expr_inContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, PhrasaParser.RULE_newline_expr_in);
    var _la = 0; // Token type

    try {
      this.state = 38;

      this._errHandler.sync(this);

      var la_ = this._interp.adaptivePredict(this._input, 3, this._ctx);

      switch (la_) {
        case 1:
          this.enterOuterAlt(localctx, 1);
          this.state = 34;
          this.newline_expr();
          break;

        case 2:
          this.enterOuterAlt(localctx, 2);
          this.state = 35;
          this.inline_expr_in();
          this.state = 36;
          _la = this._input.LA(1);

          if (!(_la === PhrasaParser.EOF || _la === PhrasaParser.NEWLINE)) {
            this._errHandler.recoverInline(this);
          } else {
            this._errHandler.reportMatch(this);

            this.consume();
          }

          break;
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  newline_expr() {
    let localctx = new Newline_exprContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, PhrasaParser.RULE_newline_expr);
    var _la = 0; // Token type

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 40;
      this.key();
      this.state = 60;

      this._errHandler.sync(this);

      var la_ = this._interp.adaptivePredict(this._input, 6, this._ctx);

      switch (la_) {
        case 1:
          this.state = 44;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === PhrasaParser.T__0) {
            this.state = 41;
            this.match(PhrasaParser.T__0);
            this.state = 46;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }

          this.state = 47;
          this.match(PhrasaParser.NEWLINE);
          this.state = 48;
          this.match(PhrasaParser.INDENT);
          this.state = 49;
          this.newline_expr_ins();
          this.state = 50;
          _la = this._input.LA(1);

          if (!(_la === PhrasaParser.EOF || _la === PhrasaParser.DEDENT)) {
            this._errHandler.recoverInline(this);
          } else {
            this._errHandler.reportMatch(this);

            this.consume();
          }

          break;

        case 2:
          this.state = 53;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          do {
            this.state = 52;
            this.match(PhrasaParser.T__0);
            this.state = 55;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          } while (_la === PhrasaParser.T__0);

          this.state = 57;
          this.inline_expr_ins();
          this.state = 58;
          _la = this._input.LA(1);

          if (!(_la === PhrasaParser.EOF || _la === PhrasaParser.NEWLINE)) {
            this._errHandler.recoverInline(this);
          } else {
            this._errHandler.reportMatch(this);

            this.consume();
          }

          break;
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  key() {
    let localctx = new KeyContext(this, this._ctx, this.state);
    this.enterRule(localctx, 8, PhrasaParser.RULE_key);
    var _la = 0; // Token type

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 63;

      this._errHandler.sync(this);

      _la = this._input.LA(1);

      do {
        this.state = 62;
        _la = this._input.LA(1);

        if (!(_la === PhrasaParser.T__1 || _la === PhrasaParser.TEXT)) {
          this._errHandler.recoverInline(this);
        } else {
          this._errHandler.reportMatch(this);

          this.consume();
        }

        this.state = 65;

        this._errHandler.sync(this);

        _la = this._input.LA(1);
      } while (_la === PhrasaParser.T__1 || _la === PhrasaParser.TEXT);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  inline_expr_ins() {
    let localctx = new Inline_expr_insContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, PhrasaParser.RULE_inline_expr_ins);
    var _la = 0; // Token type

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 67;
      this.inline_expr_in();
      this.state = 71;

      this._errHandler.sync(this);

      var _alt = this._interp.adaptivePredict(this._input, 8, this._ctx);

      while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
        if (_alt === 1) {
          this.state = 68;
          this.match(PhrasaParser.T__0);
        }

        this.state = 73;

        this._errHandler.sync(this);

        _alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
      }

      this.state = 90;

      this._errHandler.sync(this);

      _la = this._input.LA(1);

      while (_la === PhrasaParser.T__1) {
        this.state = 74;
        this.match(PhrasaParser.T__1);
        this.state = 78;

        this._errHandler.sync(this);

        _la = this._input.LA(1);

        while (_la === PhrasaParser.T__0) {
          this.state = 75;
          this.match(PhrasaParser.T__0);
          this.state = 80;

          this._errHandler.sync(this);

          _la = this._input.LA(1);
        }

        this.state = 81;
        this.inline_expr_in();
        this.state = 85;

        this._errHandler.sync(this);

        var _alt = this._interp.adaptivePredict(this._input, 10, this._ctx);

        while (_alt != 2 && _alt != antlr4.atn.ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            this.state = 82;
            this.match(PhrasaParser.T__0);
          }

          this.state = 87;

          this._errHandler.sync(this);

          _alt = this._interp.adaptivePredict(this._input, 10, this._ctx);
        }

        this.state = 92;

        this._errHandler.sync(this);

        _la = this._input.LA(1);
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  inline_expr_in() {
    let localctx = new Inline_expr_inContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, PhrasaParser.RULE_inline_expr_in);
    var _la = 0; // Token type

    try {
      this.state = 111;

      this._errHandler.sync(this);

      var la_ = this._interp.adaptivePredict(this._input, 14, this._ctx);

      switch (la_) {
        case 1:
          this.enterOuterAlt(localctx, 1);
          this.state = 93;
          this.value();
          break;

        case 2:
          this.enterOuterAlt(localctx, 2);
          this.state = 94;
          this.inline_expr();
          break;

        case 3:
          this.enterOuterAlt(localctx, 3);
          this.state = 95;
          this.match(PhrasaParser.T__2);
          this.state = 99;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === PhrasaParser.T__0) {
            this.state = 96;
            this.match(PhrasaParser.T__0);
            this.state = 101;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }

          this.state = 102;
          this.inline_expr_ins();
          this.state = 106;

          this._errHandler.sync(this);

          _la = this._input.LA(1);

          while (_la === PhrasaParser.T__0) {
            this.state = 103;
            this.match(PhrasaParser.T__0);
            this.state = 108;

            this._errHandler.sync(this);

            _la = this._input.LA(1);
          }

          this.state = 109;
          this.match(PhrasaParser.T__3);
          break;
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  value() {
    let localctx = new ValueContext(this, this._ctx, this.state);
    this.enterRule(localctx, 14, PhrasaParser.RULE_value);

    try {
      this.state = 115;

      this._errHandler.sync(this);

      var la_ = this._interp.adaptivePredict(this._input, 15, this._ctx);

      switch (la_) {
        case 1:
          this.enterOuterAlt(localctx, 1);
          this.state = 113;
          this.match(PhrasaParser.TEXT);
          break;

        case 2:
          this.enterOuterAlt(localctx, 2);
          this.state = 114;
          this.operation();
          break;
      }
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  operation() {
    let localctx = new OperationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 16, PhrasaParser.RULE_operation);

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 117;
      this.match(PhrasaParser.TEXT);
      this.state = 118;
      this.match(PhrasaParser.OPERATOR);
      this.state = 119;
      this.match(PhrasaParser.TEXT);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

  inline_expr() {
    let localctx = new Inline_exprContext(this, this._ctx, this.state);
    this.enterRule(localctx, 18, PhrasaParser.RULE_inline_expr);
    var _la = 0; // Token type

    try {
      this.enterOuterAlt(localctx, 1);
      this.state = 121;
      this.match(PhrasaParser.T__2);
      this.state = 125;

      this._errHandler.sync(this);

      _la = this._input.LA(1);

      while (_la === PhrasaParser.T__0) {
        this.state = 122;
        this.match(PhrasaParser.T__0);
        this.state = 127;

        this._errHandler.sync(this);

        _la = this._input.LA(1);
      }

      this.state = 128;
      this.key();
      this.state = 130;

      this._errHandler.sync(this);

      _la = this._input.LA(1);

      do {
        this.state = 129;
        this.match(PhrasaParser.T__0);
        this.state = 132;

        this._errHandler.sync(this);

        _la = this._input.LA(1);
      } while (_la === PhrasaParser.T__0);

      this.state = 134;
      this.inline_expr_ins();
      this.state = 138;

      this._errHandler.sync(this);

      _la = this._input.LA(1);

      while (_la === PhrasaParser.T__0) {
        this.state = 135;
        this.match(PhrasaParser.T__0);
        this.state = 140;

        this._errHandler.sync(this);

        _la = this._input.LA(1);
      }

      this.state = 141;
      this.match(PhrasaParser.T__3);
    } catch (re) {
      if (re instanceof antlr4.error.RecognitionException) {
        localctx.exception = re;

        this._errHandler.reportError(this, re);

        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }

    return localctx;
  }

}

_defineProperty(PhrasaParser, "grammarFileName", "Phrasa.g4");

_defineProperty(PhrasaParser, "literalNames", [null, "' '", "','", "'('", "')'"]);

_defineProperty(PhrasaParser, "symbolicNames", [null, null, null, null, null, "COMMENT", "OPERATOR", "TEXT", "NEWLINE", "INDENT", "DEDENT"]);

_defineProperty(PhrasaParser, "ruleNames", ["main", "newline_expr_ins", "newline_expr_in", "newline_expr", "key", "inline_expr_ins", "inline_expr_in", "value", "operation", "inline_expr"]);

PhrasaParser.EOF = antlr4.Token.EOF;
PhrasaParser.T__0 = 1;
PhrasaParser.T__1 = 2;
PhrasaParser.T__2 = 3;
PhrasaParser.T__3 = 4;
PhrasaParser.COMMENT = 5;
PhrasaParser.OPERATOR = 6;
PhrasaParser.TEXT = 7;
PhrasaParser.NEWLINE = 8;
PhrasaParser.INDENT = 9;
PhrasaParser.DEDENT = 10;
PhrasaParser.RULE_main = 0;
PhrasaParser.RULE_newline_expr_ins = 1;
PhrasaParser.RULE_newline_expr_in = 2;
PhrasaParser.RULE_newline_expr = 3;
PhrasaParser.RULE_key = 4;
PhrasaParser.RULE_inline_expr_ins = 5;
PhrasaParser.RULE_inline_expr_in = 6;
PhrasaParser.RULE_value = 7;
PhrasaParser.RULE_operation = 8;
PhrasaParser.RULE_inline_expr = 9;

class MainContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_main;
  }

  newline_expr_ins() {
    return this.getTypedRuleContext(Newline_expr_insContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterMain(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitMain(this);
    }
  }

}

class Newline_expr_insContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);

    _defineProperty(this, "NEWLINE", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(PhrasaParser.NEWLINE);
      } else {
        return this.getToken(PhrasaParser.NEWLINE, i);
      }
    });

    _defineProperty(this, "newline_expr_in", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(Newline_expr_inContext);
      } else {
        return this.getTypedRuleContext(Newline_expr_inContext, i);
      }
    });

    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_newline_expr_ins;
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterNewline_expr_ins(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitNewline_expr_ins(this);
    }
  }

}

class Newline_expr_inContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_newline_expr_in;
  }

  newline_expr() {
    return this.getTypedRuleContext(Newline_exprContext, 0);
  }

  inline_expr_in() {
    return this.getTypedRuleContext(Inline_expr_inContext, 0);
  }

  NEWLINE() {
    return this.getToken(PhrasaParser.NEWLINE, 0);
  }

  EOF() {
    return this.getToken(PhrasaParser.EOF, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterNewline_expr_in(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitNewline_expr_in(this);
    }
  }

}

class Newline_exprContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_newline_expr;
  }

  key() {
    return this.getTypedRuleContext(KeyContext, 0);
  }

  NEWLINE() {
    return this.getToken(PhrasaParser.NEWLINE, 0);
  }

  INDENT() {
    return this.getToken(PhrasaParser.INDENT, 0);
  }

  newline_expr_ins() {
    return this.getTypedRuleContext(Newline_expr_insContext, 0);
  }

  inline_expr_ins() {
    return this.getTypedRuleContext(Inline_expr_insContext, 0);
  }

  DEDENT() {
    return this.getToken(PhrasaParser.DEDENT, 0);
  }

  EOF() {
    return this.getToken(PhrasaParser.EOF, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterNewline_expr(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitNewline_expr(this);
    }
  }

}

class KeyContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);

    _defineProperty(this, "TEXT", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(PhrasaParser.TEXT);
      } else {
        return this.getToken(PhrasaParser.TEXT, i);
      }
    });

    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_key;
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterKey(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitKey(this);
    }
  }

}

class Inline_expr_insContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);

    _defineProperty(this, "inline_expr_in", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTypedRuleContexts(Inline_expr_inContext);
      } else {
        return this.getTypedRuleContext(Inline_expr_inContext, i);
      }
    });

    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_inline_expr_ins;
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterInline_expr_ins(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitInline_expr_ins(this);
    }
  }

}

class Inline_expr_inContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_inline_expr_in;
  }

  value() {
    return this.getTypedRuleContext(ValueContext, 0);
  }

  inline_expr() {
    return this.getTypedRuleContext(Inline_exprContext, 0);
  }

  inline_expr_ins() {
    return this.getTypedRuleContext(Inline_expr_insContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterInline_expr_in(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitInline_expr_in(this);
    }
  }

}

class ValueContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_value;
  }

  TEXT() {
    return this.getToken(PhrasaParser.TEXT, 0);
  }

  operation() {
    return this.getTypedRuleContext(OperationContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterValue(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitValue(this);
    }
  }

}

class OperationContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);

    _defineProperty(this, "TEXT", function (i) {
      if (i === undefined) {
        i = null;
      }

      if (i === null) {
        return this.getTokens(PhrasaParser.TEXT);
      } else {
        return this.getToken(PhrasaParser.TEXT, i);
      }
    });

    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_operation;
  }

  OPERATOR() {
    return this.getToken(PhrasaParser.OPERATOR, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterOperation(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitOperation(this);
    }
  }

}

class Inline_exprContext extends antlr4.ParserRuleContext {
  constructor(parser, parent, invokingState) {
    if (parent === undefined) {
      parent = null;
    }

    if (invokingState === undefined || invokingState === null) {
      invokingState = -1;
    }

    super(parent, invokingState);
    this.parser = parser;
    this.ruleIndex = PhrasaParser.RULE_inline_expr;
  }

  key() {
    return this.getTypedRuleContext(KeyContext, 0);
  }

  inline_expr_ins() {
    return this.getTypedRuleContext(Inline_expr_insContext, 0);
  }

  enterRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.enterInline_expr(this);
    }
  }

  exitRule(listener) {
    if (listener instanceof PhrasaListener) {
      listener.exitInline_expr(this);
    }
  }

}

PhrasaParser.MainContext = MainContext;
PhrasaParser.Newline_expr_insContext = Newline_expr_insContext;
PhrasaParser.Newline_expr_inContext = Newline_expr_inContext;
PhrasaParser.Newline_exprContext = Newline_exprContext;
PhrasaParser.KeyContext = KeyContext;
PhrasaParser.Inline_expr_insContext = Inline_expr_insContext;
PhrasaParser.Inline_expr_inContext = Inline_expr_inContext;
PhrasaParser.ValueContext = ValueContext;
PhrasaParser.OperationContext = OperationContext;
PhrasaParser.Inline_exprContext = Inline_exprContext;