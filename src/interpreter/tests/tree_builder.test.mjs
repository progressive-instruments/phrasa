import * as fs from 'fs';
import {TreeBuilder} from '../dist/TreeBuilder.js'

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
    let tree = treeBuilder.build(new TextContent("bla", "tests/files/tree_builder_test.piece"), null ,null)
    let root = tree.rootPhrase;
    expect(root.tempo).toEqual(["120bpm"]);
    let phrases = root.phrases;
    expect(phrases.length).toEqual(2);
    expect(phrases[0].length).toEqual("1/4");
    expect(phrases[0].events.has('saw_synth')).toBeTrue();
    expect(phrases[0].beat == undefined || phrases[0].beat == false).toBeTrue();
    expect(phrases[1].beat).toBeTrue();

    let sawSynth = phrases[0].events.get('saw_synth');
    expect(sawSynth.has('frequency')).toBeTrue();
    expect(sawSynth.get('frequency')).toEqual("C3");

    expect(phrases[1].events.has('saw_synth')).toBeTrue();
    sawSynth = phrases[1].events.get('saw_synth');
    expect(sawSynth.has('frequency')).toBeTrue();
    expect(sawSynth.get('frequency')).toEqual("D3");
  });
});