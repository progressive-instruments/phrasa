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
    let phrases = root.phrases;
    expect(phrases.length).toEqual(2);
    expect(phrases[0].length).toEqual("1/4");
    expect(phrases[0].beat == undefined || phrases[0].beat == false).toBeTrue();
    expect(phrases[1].beat).toBeTrue();

    expect(phrases[0].sounds.has('saw_synth')).toBeTrue();
    let sawSynth = phrases[0].sounds.get('saw_synth');
    expect(sawSynth.size).toEqual(1);
    expect(sawSynth.get(0).values.has('frequency')).toBeTrue();
    expect(sawSynth.get(0).values.get('frequency')).toEqual("C3");

    expect(phrases[1].sounds.has('saw_synth')).toBeTrue();
    sawSynth = phrases[1].sounds.get('saw_synth');
    expect(sawSynth.size).toEqual(1);
    expect(sawSynth.get(0).values.has('frequency')).toBeTrue();
    expect(sawSynth.get(0).values.get('frequency')).toEqual("D3");
  });

  it('offset', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/offset_test"), null ,null)
    let root = tree.rootPhrase;
    let inst1 = root.sounds.get('a');
    let inst2 = root.sounds.get('b');

    expect(inst1.get(0).startOffset).toEqual("10%");
    expect(inst1.get(0).endOffset).toEqual("-10%");
    expect(inst2.get(0).startOffset).toEqual("0.1");
    expect(inst2.get(0).endOffset).toEqual("-0.1");
  });
  
});