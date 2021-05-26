import * as fs from 'fs';
import {TreeBuilder} from '../../dist/src/TreeBuilder.js'
import {SequenceTrigger} from '../../dist/src/PieceTree.js'
class TextContent {
    constructor(name,file) {
      this.name = name;
      this.readAll = () => {
        return fs.readFileSync(file, 'utf8');
      }
    }
}

describe("tree builder", function() {
  it('builddd', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/general_test"), null ,null)
    let root = tree.rootPhrase;
    expect(root.tempo).toEqual("120bpm");
    expect(root.totalPhrases).toEqual(2);
    let phrases = root.phrases;
    expect(phrases.length).toEqual(2);
    expect(phrases[0].phraseLength).toEqual("1/4");
    expect(phrases[0].beat == undefined || phrases[0].beat == false).toBeTrue();
    expect(phrases[1].beat).toBeTrue();

    expect(phrases[0].sounds.has('saw_synth')).toBeTrue();
    let sawSynth = phrases[0].sounds.get('saw_synth');
    expect(sawSynth.events.size).toEqual(1);
    expect(sawSynth.events.get(0).frequency).toBeDefined();
    expect(sawSynth.events.get(0).frequency.type).toEqual('frequency');
    expect(sawSynth.events.get(0).frequency.value).toEqual("440");
    expect(sawSynth.events.get(0).values.has('cutoff')).toBeTrue();
    expect(sawSynth.events.get(0).values.get('cutoff')).toEqual("90%");
    expect(sawSynth.events.get(0).values.has('attack')).toBeTrue();
    expect(sawSynth.events.get(0).values.get('attack')).toEqual("80%");

    expect(phrases[1].sounds.has('saw_synth')).toBeTrue();
    sawSynth = phrases[1].sounds.get('saw_synth');
    expect(sawSynth.events.size).toEqual(1);
    expect(sawSynth.events.get(0).frequency).toBeDefined();
    expect(sawSynth.events.get(0).frequency.type).toEqual('note');
    expect(sawSynth.events.get(0).frequency.value).toEqual("D3");
    expect(sawSynth.events.get(0).values.has('attack')).toBeTrue();
    expect(sawSynth.events.get(0).values.get('attack')).toEqual("80%");

    expect(root.branches.has('b')).toBeTrue();
    let branch = root.branches.get('b');
    expect(branch.phrases.length).toEqual(2);
    for(let i = 0 ; i < branch.phrases.length ; ++i) {
      sawSynth = branch.phrases[i].sounds.get('saw_synth');
      expect(sawSynth.events.get(0).frequency.value).toEqual('220');
    }
  });

  it('offset', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/offset_test"), null ,null)
    let root = tree.rootPhrase;
    let inst1 = root.sounds.get('a');
    let inst2 = root.sounds.get('b');

    expect(inst1.events.get(0).startOffset).toEqual("10%");
    expect(inst1.events.get(0).endOffset).toEqual("-10%");
    expect(inst2.events.get(0).startOffset).toEqual("0.1");
    expect(inst2.events.get(0).endOffset).toEqual("-0.1");
  });

  it('selector', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/selector_test"), null ,null)
    let root = tree.rootPhrase;
    expect(root.phrases.length).toEqual(2);
    let events = root.phrases[0].sounds.get('saw_synth').events
    expect(events.get(0).values.size).toEqual(1);
    expect(events.get(0).values.get('cutoff')).toEqual("100%");
    events = root.phrases[1].sounds.get('saw_synth').events
    expect(events.get(0).values.size).toEqual(2);
    expect(events.get(0).values.get('cutoff')).toEqual("80%");
    expect(events.get(0).values.get('attack')).toEqual("90%");
  });

  it('pitchtest', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/pitch_test"), null ,null)
    let root = tree.rootPhrase;
    expect(root.pitch.zone).toBeCloseTo(293.66);
    expect(root.pitch.grid[14]).toBeCloseTo(196);
    expect(root.pitch.grid[15]).toBeCloseTo(261.63);
    expect(root.pitch.grid[16]).toBeCloseTo(329.63);
    expect(root.pitch.grid[17]).toBeCloseTo(392);
    let events = root.phrases[0].sounds.get('saw_synth').events
    expect(events.get(0).frequency.type).toEqual("pitch");
    expect(events.get(0).frequency.value).toEqual("2");
    events = root.phrases[1].sounds.get('saw_synth').events
    expect(events.get(0).frequency.type).toEqual("pitch");
    expect(events.get(0).frequency.value).toEqual("-1");
  });

  it('sequencetest', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/sequence_test"), null ,null)
    let root = tree.rootPhrase;
    expect(root.sequences.has('seq1')).toBeTrue();
    expect(root.sequences.get('seq1')).toEqual(['3','2','1']);
    expect(root.phrases[0].sequences.has('seq1')).toBeTrue();
    expect(root.phrases[0].sequences.get('seq1')).toEqual(['4']);
    expect(root.phrases[1].sequences.has('seq2')).toBeTrue();
    expect(root.phrases[1].sequences.get('seq2')).toEqual(['4','erez','-1']);
    let inst = root.sounds.get('inst1'); 
    let val = inst.events.get(0).frequency.value;

    expect(val).toBeInstanceOf(SequenceTrigger);
    expect(val.name).toEqual('seq1');
    expect(val.steps).toEqual(-2);
    
    for(let i = 0 ; i < 2 ; ++i) {
      inst = root.phrases[i].sounds.get('inst2');
      let e = inst.events.get(0);
      let freqVal  = e.frequency.value;
      expect(freqVal).toBeInstanceOf(SequenceTrigger);
      expect(freqVal.name).toEqual('seq2');
      expect(freqVal.steps).toEqual(1);
    }
  });

  it('each', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/each_test"), null ,null)
    let root = tree.rootPhrase;
    expect(root.phrases.length).toEqual(4)
    let freqs = ['330','220','330','330']
    for(let i = 0 ; i < root.phrases.length; ++i) {
      let event = root.phrases[i].sounds.get('saw_synth').events.get(0);
      expect(event.frequency.value).toEqual(freqs[i]);
      if(i == 2) {
        expect(event.values.get('cutoff')).toEqual('100%');
      }
    }
  });

});