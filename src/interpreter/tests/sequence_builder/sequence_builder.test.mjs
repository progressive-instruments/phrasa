
import {SequenceBuilder} from '../../dist/src/SequenceBuilder.js'
import {SequenceTrigger} from '../../dist/src/PieceTree.js'

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
              endOffset: '90%',
            }]])
          }
          
        ],
        [
          'sine_synth', 
          {
            events: new Map([[0, {
              values: new Map([['frequency', 'D3']]),
              startOffset: '0.2',
              endOffset: '0.8',
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

  it('pitch', function () {
    let tree = {};
    tree.rootPhrase = {
      tempo: '120bpm',
      beat: true,
      pitch: {
        grid: [50, 100, 200, 300, 400],
        zone: 260
      },
      phrases: [
        {
          sounds: new Map([
            [
              'saw_synth', 
              {
                events: new Map(
                  [
                    [
                      0, 
                      {
                        frequency: {type: 'pitch', value: '2'}
                      }
                    ],
                    [
                      1, 
                      {
                        frequency: {type: 'pitch', value: '-1'}
                      }
                    ]
                  ])
              }
              
            ]
          ])
        }
      ]
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].values.has('frequency')).toBeTrue();
    expect(sequence.events[0].values.get('frequency')).toBeCloseTo(400);
    expect(sequence.events[1].values.has('frequency')).toBeTrue();
    expect(sequence.events[1].values.get('frequency')).toBeCloseTo(100);
  });

  it('frequency', function () {
    let tree = {};
    tree.rootPhrase = {
      tempo: '120bpm',
      beat: true,
      sequences: new Map([
        ['seq1', ['C3','D4','F3']]
      ]),
      phrases: []
    };
    for(let i = 0 ; i < 2; ++i) {
      let phrase = {phrases:[]};
      tree.rootPhrase.phrases.push(phrase);
      for(let j = 0 ; j < 4; ++j) {
        phrase.phrases.push({sounds: new Map([
          [
            'saw_synth', 
            {
              events: new Map(
                [
                  [
                    0, 
                    {
                      frequency: {type: 'note', value: new SequenceTrigger('seq1',1)}
                    }
                  ]
                ])
            }
            
          ]
        ])});
      }
    }
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree);
    expect(sequence.events.length).toEqual(8);
    let expectedValues = [130.81, 293.66, 174.61, 130.81, 293.66, 174.61, 130.81, 293.66];
    for(let i = 0 ; i < sequence.events.length ; ++i) {
      expect(sequence.events[i].values.has('frequency')).toBeTrue();
      expect(sequence.events[i].values.get('frequency')).toBeCloseTo(expectedValues[i]);
    }

  });

});