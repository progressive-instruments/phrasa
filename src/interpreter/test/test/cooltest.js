let assert = require('assert');
let parserFacade = require('../ParserFacade.js');
let NotesLexer = require('../../generated-parser/NotesLexer.js').NotesLexer;

function checkToken(tokens, index, typeName, column, text) {
    it('should have ' + typeName + ' in position ' + index, function () {
        assert.strictEqual(tokens[index].type, NotesLexer[typeName]);
        assert.strictEqual(tokens[index].column, column);
        assert.strictEqual(tokens[index].text, text);
    });
}
describe('Basic lexing without spaces', function () {
    let tokens = parserFacade.getTokens("C3,d#-2");
    it('should return 3 tokens', function() {
      assert.strictEqual(tokens.length, 3);
    });
    checkToken(tokens, 0, 'NOTE', 0, "C3");
    checkToken(tokens, 1, 'PSIK', 2, ",");
    checkToken(tokens, 2, 'NOTE', 3, "d#-2");
});

describe('Output check', function () {
    let notes = parserFacade.getNotes("C3,d#-2");
    it('should return 2 notes', function() {
      assert.strictEqual(notes.length, 2);
    });
    it('note check',() => {
        assert.strictEqual(notes[0],"C3");
        assert.strictEqual(notes[1],"d#-2");
    } )
    
    
});