import {PhrasaInterpreter} from  '../index.js';
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
    let obj = main.object();
    expect(obj).not.toEqual(null);

    let declarations = obj.declaration();
    expect(declarations.length).toBe(3);
    checkToken(declarations[0].key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'key');
    checkToken(declarations[0].value().TEXT().symbol, PhrasaLexer.TEXT, 'value');
    
    checkToken(declarations[1].key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'key2');
    checkToken(declarations[1].value().TEXT().symbol, PhrasaLexer.TEXT, 'value2');

    checkToken(declarations[2].key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'keyobj');
    let innerObj = declarations[2].object();
    expect(innerObj).not.toEqual(null);
    let innerDeclarations = innerObj.declaration();
    expect(innerDeclarations.length).toEqual(2);
    checkToken(innerDeclarations[0].key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'objkey');
    checkToken(innerDeclarations[0].value().TEXT().symbol, PhrasaLexer.TEXT, 'objval');

    checkToken(innerDeclarations[1].key().TEXT()[0].symbol, PhrasaLexer.TEXT, 'objkey2');
    checkToken(innerDeclarations[1].value().TEXT().symbol, PhrasaLexer.TEXT, 'objval2');

  });

});

