import PhrasaLexer from '../generated-parser/PhrasaLexer.js'
import * as fs from 'fs';
import PhrasaParser from '../generated-parser/PhrasaParser.js';
import {InputStream, Token, CommonTokenStream, tree} from 'antlr4'

describe("testingim", function() {

  function checkToken(token, type, text=null) {
      expect(token.type).toEqual(type);
      if(text != null) {
        expect(token.text).toEqual(text);

      }
  }

  it('Basic lexing', function () {


    let data = fs.readFileSync("tests/files/simple.piece", 'utf8');

    const chars = new InputStream(data);
    const lexer = new PhrasaLexer(chars);
    let tokens =  lexer.getAllTokens();

    checkToken(tokens[0], PhrasaLexer.TEXT, 'key');
    checkToken(tokens[1], PhrasaLexer.TEXT, 'value');
    checkToken(tokens[2], PhrasaLexer.NEWLINE);
    checkToken(tokens[3], PhrasaLexer.TEXT, 'key2');
    checkToken(tokens[4], PhrasaLexer.TEXT, 'value2');
    checkToken(tokens[5], PhrasaLexer.NEWLINE);
    checkToken(tokens[6], PhrasaLexer.TEXT, 'keyobj');
    checkToken(tokens[7], PhrasaLexer.NEWLINE);
    checkToken(tokens[8], PhrasaParser.INDENT);
    checkToken(tokens[9], PhrasaLexer.TEXT, 'objkey');
    checkToken(tokens[10], PhrasaLexer.TEXT, 'objval');
    checkToken(tokens[11], PhrasaLexer.NEWLINE);
    checkToken(tokens[12], PhrasaLexer.TEXT, 'objkey2');
    checkToken(tokens[13], PhrasaLexer.TEXT, 'objval2');
  });

  it('Basic parsing', function () {
    let data = fs.readFileSync("tests/files/simple.piece", 'utf8');

    const chars = new InputStream(data);
    let lexer = new PhrasaLexer(chars);
    const stream = new CommonTokenStream(lexer);
    const parser = new PhrasaParser(stream);
    let main = parser.main();
    expect(main).not.toEqual(null);
    let mainExprIns = main.newline_expr_ins();
    expect(mainExprIns).not.toEqual(null);

    mainExprIns = mainExprIns.newline_expr_in();
    expect(mainExprIns.length).toBe(3);
    let expr = mainExprIns[0].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'key');
    let exprInputs = expr.inline_expr_ins().inline_expr_in();
    checkToken(exprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, 'value');
    
    expr = mainExprIns[1].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'key2');
    exprInputs = expr.inline_expr_ins().inline_expr_in();
    checkToken(exprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, 'value2');

    expr = mainExprIns[2].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'keyobj');

    let innerExprInputs = expr.newline_expr_ins().newline_expr_in();
    expect(innerExprInputs.length).toEqual(2);

    expr = innerExprInputs[0].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'objkey');
    exprInputs = expr.inline_expr_ins().inline_expr_in();
    checkToken(exprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, 'objval');

    expr = innerExprInputs[1].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'objkey2');
    exprInputs = expr.inline_expr_ins().inline_expr_in();
    checkToken(exprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, 'objval2');

  });

  it('inner expr', function () {
    let data = fs.readFileSync("tests/files/inner_expr", 'utf8');

    const chars = new InputStream(data);
    let lexer = new PhrasaLexer(chars);
    const stream = new CommonTokenStream(lexer);
    const parser = new PhrasaParser(stream);
    let main = parser.main();
    expect(main).not.toEqual(null);
    let mainExprIns = main.newline_expr_ins();
    expect(mainExprIns).not.toEqual(null);

    mainExprIns = mainExprIns.newline_expr_in();
    expect(mainExprIns.length).toBe(1);
    let expr = mainExprIns[0].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'key');
    let exprInputs = expr.inline_expr_ins().inline_expr_in();
    let inlineExpr = exprInputs[0].inline_expr();
    checkToken(inlineExpr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'innerkey');
    
    let innerExprInputs = inlineExpr.inline_expr_ins().inline_expr_in();
    checkToken(innerExprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, 'value');
  });

  it('inner exp 2r', function () {
    let data = fs.readFileSync("tests/files/inner_expr2", 'utf8');

    const chars = new InputStream(data);
    let lexer = new PhrasaLexer(chars);
    const stream = new CommonTokenStream(lexer);
    const parser = new PhrasaParser(stream);
    let main = parser.main();
    expect(main).not.toEqual(null);
    let mainExprIns = main.newline_expr_ins();
    expect(mainExprIns).not.toEqual(null);

    mainExprIns = mainExprIns.newline_expr_in();
    expect(mainExprIns.length).toBe(1);
    let expr = mainExprIns[0].newline_expr();
    checkToken(expr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'key');
    let exprInputs = expr.inline_expr_ins().inline_expr_in();

    checkToken(exprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, 'value');
    checkToken(exprInputs[1].TEXT().symbol, PhrasaLexer.TEXT, '3');
    
    let innerExpr = exprInputs[2].inline_expr();
    checkToken(innerExpr.key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'innerkey');
    
    let innerExprInputs = innerExpr.inline_expr_ins().inline_expr_in();
    checkToken(innerExprInputs[0].TEXT().symbol, PhrasaLexer.TEXT, '1');
    checkToken(innerExprInputs[1].TEXT().symbol, PhrasaLexer.TEXT, '2');

    let innerList = exprInputs[3].inline_expr_ins().inline_expr_in();
    checkToken(innerList[0].TEXT().symbol, PhrasaLexer.TEXT, 'a');
    checkToken(innerList[1].TEXT().symbol, PhrasaLexer.TEXT, 'b');
    checkToken(innerList[2].TEXT().symbol, PhrasaLexer.TEXT, 'c');

    
  });
});

