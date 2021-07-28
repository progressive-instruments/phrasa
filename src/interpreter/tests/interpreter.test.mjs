import * as fs from 'fs';

import {Interpreter} from '../dist/index.js'


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
    let interpreter = new Interpreter();
    let sequence = interpreter.parseEvents(new TextContent("bla", "tests/files/interpreter_test.piece"), null ,null).sequence
    expect(sequence.endTime).toEqual(750);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toBeCloseTo(0);
    expect(sequence.events[0].durationMs).toBeCloseTo(250,-1);
    expect(sequence.events[1].startTimeMs).toBeCloseTo(250);
    expect(sequence.events[1].durationMs).toBeCloseTo(500,-1);
  });

  it('bpm-error', function () {
    let interpreter = new Interpreter();
    let res = interpreter.parseEvents(new TextContent("bla", "tests/files/bpm-error"), null ,null)
    expect(res.errors.length).toEqual(1);
    const pos = res.errors[0].errorPosition;
    expect(pos.start.line).toEqual(1);
    expect(pos.start.column).toEqual(6);
    expect(pos.end.line).toEqual(1);
    expect(pos.end.column).toEqual(11);
  });

  
  it('additional-word-error', function () {
    let interpreter = new Interpreter();
    let res = interpreter.parseEvents(new TextContent("bla", "tests/files/additional-word-error"), null ,null)
    expect(res.errors.length).toEqual(1);
    const pos = res.errors[0].errorPosition;
    expect(pos.start.line).toEqual(1);
    expect(pos.start.column).toEqual(13);
    expect(pos.end.line).toEqual(1);
    expect(pos.end.column).toEqual(19);
  });

  it('unknown-prop-error', function () {
    let interpreter = new Interpreter();
    let res = interpreter.parseEvents(new TextContent("bla", "tests/files/unknown-prop-error"), null ,null)
    expect(res.errors.length).toEqual(1);
    const pos = res.errors[0].errorPosition;
    expect(pos.start.line).toEqual(3);
    expect(pos.start.column).toEqual(0);
    expect(pos.end.line).toEqual(3);
    expect(pos.end.column).toEqual(9);
  });
});
