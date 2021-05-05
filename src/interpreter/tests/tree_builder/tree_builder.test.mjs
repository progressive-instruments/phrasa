import * as fs from 'fs';
import {TreeBuilder} from '../../dist/src/TreeBuilder.js'

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
});