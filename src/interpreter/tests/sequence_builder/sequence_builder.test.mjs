
import {SequenceBuilder} from '../../dist/src/SequenceBuilder.js'

describe("sequence builder", function() {
  it('builddd', function () {
    let tree = {};
    tree.rootPhrase = {
      tempo: '120bpm',
      phrases: [
        {
          phraseLength: '1/2',
          sounds: new Map([
            [
              'saw_synth', 
              {
                events: new Map([[0, 
                  {
                    values: new Map([['cutoff', '100%']]),
                    frequency: {type: 'frequency', value: '440'}
                  }]])
              }
              
            ]
          ])
        },
        {
          beat: true,
          phraseLength: '1/2',
          sounds: new Map([
            [
              'saw_synth', 
              {
                events: new Map([[0,
                  {
                    frequency: {type: 'note', value: 'C3'}
                  }]])
              }
              
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
    expect(sequence.events[0].values.has('cutoff')).toBeTrue();
    expect(sequence.events[0].values.get('cutoff')).toEqual('100%');
    expect(sequence.events[0].values.has('frequency')).toBeTrue();
    expect(sequence.events[0].values.get('frequency')).toBeCloseTo('440');
    expect(sequence.events[1].startTimeMs).toBeCloseTo(500);
    expect(sequence.events[1].durationMs).toBeCloseTo(500);
    expect(sequence.events[1].values.has('frequency')).toBeTrue();
    expect(sequence.events[1].values.get('frequency')).toBeCloseTo(130.81);
  });

  it('offset', function () {
    let tree = {};
    tree.rootPhrase = {
      tempo: '120bpm',
      beat: true,
      sounds: new Map([
        [
          'saw_synth', 
          {
            events: new Map([[0, {
              values: new Map([['frequency', 'D3']]),
              startOffset: '10%',
              endOffset: '-10%',
            }]])
          }
          
        ],
        [
          'sine_synth', 
          {
            events: new Map([[0, {
              values: new Map([['frequency', 'D3']]),
              startOffset: '0.2',
              endOffset: '-0.2',
            }]])
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

  it('lengthtest', function () {
    let tree = {};
    const phrase = {
      phraseLength: '1/2',
      sounds: new Map([
        [
          'saw_synth', 
          {
            events: new Map([[0, 
              {
                frequency: {type: 'frequency', value: '440'}
              }]])
          }
          
        ]
      ])
    };
    tree.rootPhrase = {
      tempo: '120bpm',
      beat: true,
      phrases: [
        phrase,phrase,phrase
      ],
      totalPhrases: 2,
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toBeCloseTo(0);
    expect(sequence.events[0].durationMs).toBeCloseTo(250);
    expect(sequence.events[1].startTimeMs).toBeCloseTo(250);
    expect(sequence.events[1].durationMs).toBeCloseTo(250);
  });
});