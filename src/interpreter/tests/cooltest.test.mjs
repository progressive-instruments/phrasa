import {PhrasaInterpreter} from  '../index.js';
import NotesLexer from '../generated-parser/NotesLexer.js'


describe("testingim", function() {

  function checkToken(tokens, index, typeName, column, text) {
    tokens[index].text
      expect(tokens[index].type).toEqual(NotesLexer[typeName]);
      expect(tokens[index].column).toEqual(column);
      expect(tokens[index].text).toEqual(text);
  }

  it('Basic lexing without spaces', function () {
      let interpreter = new PhrasaInterpreter();
      let tokens = interpreter.getTokens("C3,d#-2");
      expect(tokens.length).toEqual(3);
      checkToken(tokens, 0, 'NOTE', 0, "C3");
      checkToken(tokens, 1, 'PSIK', 2, ",");
      checkToken(tokens, 2, 'NOTE', 3, "d#-2");
  });

  it('Output check', function () {
      let interpreter = new PhrasaInterpreter();
      let notes = interpreter.getNotes("C3,d#-2");

      expect(notes.length).toEqual(2);
      expect(notes[0]).toEqual("C3");
      expect(notes[1]).toEqual("d#-2");
      
      
  });

});

