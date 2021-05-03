
import {SequenceBuilder} from '../../dist/src/SequenceBuilder.js'

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
    expect(sequence.events[0].startTimeMs).toBeCloseTo(0);
    expect(sequence.events[0].durationMs).toBeCloseTo(500);
    expect(sequence.events[1].startTimeMs).toBeCloseTo(500);
    expect(sequence.events[1].durationMs).toBeCloseTo(500);
  });

  it('offset', function () {
    let tree = {};
    tree.rootPhrase = {
      tempo: '120bpm',
      beat: true,
      events: new Map([
        [
          'saw_synth', 
          {
            values: new Map([['frequency', 'D3']]),
            startOffset: '10%',
            endOffset: '-10%',
          }
        ],
        [
          'sine_synth', 
          {
            values: new Map([['frequency', 'D3']]),
            startOffset: '0.2',
            endOffset: '-0.2',
          }
        ]
      ])
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toBeCloseTo(50);
    expect(sequence.events[0].durationMs).toBeCloseTo(400);
    expect(sequence.events[1].startTimeMs).toBeCloseTo(100);
    expect(sequence.events[1].durationMs).toBeCloseTo(300);
  });
});