
import {SequenceBuilder} from '../../dist/src/SequenceBuilder.js'

describe("sequence builder", function() {
  it('builddd', function () {
    let tree = {};
    tree.rootSection = {
      tempo: {value: '120bpm'},
      sections: [
        {
          sectionLength: {value: '1/2'},
          events: new Map([[0, 
            {
              instrument: {value:'saw_synth'},
              values: new Map([['cutoff', {value:'100%'}]]),
              pitch: { value: '440hz'}
            }]])
        },
        {
          beat: {value:true},
          sectionLength: {value:'1/2'},
          events: new Map([[0,
            {
              instrument: {value:'saw_synth'},
              pitch: { value: 'C3'}
            }]])
        }
      ]
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree).sequence;
    expect(sequence.endTime).toEqual(1000);
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toBeCloseTo(0);
    expect(sequence.events[0].durationMs).toBeCloseTo(500,-1);
    expect(sequence.events[0].values.has('cutoff')).toBeTrue();
    expect(sequence.events[0].values.get('cutoff')).toEqual(1.0);
    expect(sequence.events[0].values.has('frequency')).toBeTrue();
    expect(sequence.events[0].values.get('frequency')).toBeCloseTo('440');
    expect(sequence.events[1].startTimeMs).toBeCloseTo(500);
    expect(sequence.events[1].durationMs).toBeCloseTo(500,-1);
    expect(sequence.events[1].values.has('frequency')).toBeTrue();
    expect(sequence.events[1].values.get('frequency')).toBeCloseTo(130.81);
  });

  it('offset', function () {
    let tree = {};
    tree.rootSection = {
      tempo:{value:'120bpm'},
      beat: {value:true},
      events: new Map([
        [0, {
          instrument: {value:'saw_synth'},
          values: new Map([['pitch', {value:'D3'}]]),
          startOffset: {value:'10%'},
          endOffset: {value:'90%'},
        }],
        [1, {
          instrument: {value:'sine_synth'},
          values: new Map([['pitch', {value:'D3'}]]),
          startOffset: {value:'0.2'},
          endOffset: {value:'0.8'},
        }]
      ])
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree).sequence;
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].startTimeMs).toBeCloseTo(50);
    expect(sequence.events[0].durationMs).toBeCloseTo(400);
    expect(sequence.events[1].startTimeMs).toBeCloseTo(100);
    expect(sequence.events[1].durationMs).toBeCloseTo(300);
  });

  it('pitch', function () {
    let tree = {};
    tree.rootSection = {
      tempo: {value:'120bpm'},
      beat: {value:true},
      pitch: {
        grid: {value:[50, 100, 200, 300, 400]},
        zone: {value:260}
      },
      defaultInstrument: {value:'saw_synth'},
      sections: [
        {
          events: new Map(
            [
              [
                0, 
                {
                  pitch: { value: '2'}
                }
              ],
              [
                1, 
                {
                  pitch: { value: '-1'}
                }
              ]
            ])
        }
      ]
    };
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree).sequence;
    expect(sequence.events.length).toEqual(2);
    expect(sequence.events[0].values.has('frequency')).toBeTrue();
    expect(sequence.events[0].values.get('frequency')).toBeCloseTo(400);
    expect(sequence.events[1].values.has('frequency')).toBeTrue();
    expect(sequence.events[1].values.get('frequency')).toBeCloseTo(100);
  });

  it('frequency', function () {
    let tree = {};
    tree.rootSection = {
      tempo: {value:'120bpm'},
      beat: {value:true},
      sections: []
    };
    for(let i = 0 ; i < 2; ++i) {
      let section = {sections:[]};
      tree.rootSection.sections.push(section);
      for(let j = 0 ; j < 4; ++j) {
        section.sections.push({events: new Map(
          [
            [
              0, 
              {
                instrument: {value:'saw_synth'},
                pitch: { value: 'C3'}
              }
            ]
          ])});
      }
    }
    let sequenceBuilder = new SequenceBuilder();
    let sequence = sequenceBuilder.build(tree).sequence;
    expect(sequence.events.length).toEqual(8);
    for(let i = 0 ; i < sequence.events.length ; ++i) {
      expect(sequence.events[i].values.has('frequency')).toBeTrue();
      expect(sequence.events[i].values.get('frequency')).toBeCloseTo(130.81);
    }

  });
  it('bpm-error', function () {
    let tree = {};
    tree.rootSection = {
      tempo: {value: '120bp'},
      sections: [
        {
          beat: {value:true},
          events: new Map([[0,
            {
              instrument: {value:'saw_synth'},
              pitch: { value: 'C3'}
            }]])
        }
      ]
    };
    let sequenceBuilder = new SequenceBuilder();
    let res = sequenceBuilder.build(tree);
    expect(res.errors.length).toEqual(1);
  });


});