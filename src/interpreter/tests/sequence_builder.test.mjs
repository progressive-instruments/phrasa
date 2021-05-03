
import {SequenceBuilder} from '../dist/src/SequenceBuilder.js'

describe("sequence builder", function() {
  it('builddd', function () {
    let tree = {};
    tree.rootPhrase = {
      tempo: '120bpm',
      phrases: [
        {
          length: '1/2',
          events: new Map([
            [
              'saw_synth', 
              {values: new Map([['frequency', 'D3']])}
            ]
          ])
        },
        {
          beat: true,
          length: '1/2',
          events: new Map([
            [
              'saw_synth', 
              {values: new Map([['frequency', 'C3']])}
            ]
          ])
        }
      ]
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree);
    expect(sequence.endTime).toEqual(1000);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toEqual(0);
    expect(sequence.events[0].durationMs).toEqual(500);
    expect(sequence.events[1].startTimeMs).toEqual(500);
    expect(sequence.events[1].durationMs).toEqual(500);
  });
});