import * as fs from 'fs';

import {PhrasaInterpreter} from '../dist/index.js'


class TextContent {
  constructor(name,file) {
    this.name = name;
    this.readAll = () => {
      return fs.readFileSync(file, 'utf8');
    }
  }
}

describe("interpreter", function() {
  it('interpret', function () {
    let interpreter = new PhrasaInterpreter();
    let sequence = interpreter.parseEvents(new TextContent("bla", "tests/files/interpreter_test.piece"), null ,null)
    expect(sequence.endTime).toEqual(750);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toEqual(0);
    expect(sequence.events[0].durationMs).toEqual(250);
    expect(sequence.events[1].startTimeMs).toEqual(250);
    expect(sequence.events[1].durationMs).toEqual(500);
  });
});
