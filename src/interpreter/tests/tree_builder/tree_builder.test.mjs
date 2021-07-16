import * as fs from 'fs';
import {TreeBuilder} from '../../dist/src/TreeBuilder/TreeBuilder.js'
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
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/general_test"), null ,null).tree
    let root = tree.rootSection;
    expect(root.tempo.value).toEqual("120bpm");
    expect(root.totalSections.value).toEqual(2);
    let sections = root.sections;
    expect(sections.length).toEqual(2);
    expect(sections[0].sectionLength.value).toEqual("1/4");
    expect(sections[0].beat == undefined || sections[0].beat == false).toBeTrue();
    expect(sections[1].beat.value).toBeTrue();

    let section = sections[0];
    expect(section.events.size).toEqual(1);
    expect(section.events.get(0).frequency).toBeDefined();
    expect(section.events.get(0).frequency.value.type).toEqual('frequency');
    expect(section.events.get(0).frequency.value.value).toEqual("440");
    expect(section.events.get(0).values.has('cutoff')).toBeTrue();
    expect(section.events.get(0).values.get('cutoff').value).toEqual("90%");
    expect(section.events.get(0).values.has('attack')).toBeTrue();
    expect(section.events.get(0).values.get('attack').value).toEqual("80%");

    section = sections[1]
    expect(section.events.size).toEqual(1);
    expect(section.events.get(0).frequency).toBeDefined();
    expect(section.events.get(0).frequency.value.type).toEqual('note');
    expect(section.events.get(0).frequency.value.value).toEqual("D3");
    expect(section.events.get(0).values.has('attack')).toBeTrue();
    expect(section.events.get(0).values.get('attack').value).toEqual("80%");

    expect(root.branches.has('b')).toBeTrue();
    let branch = root.branches.get('b');
    expect(branch.sections.length).toEqual(2);
    for(let i = 0 ; i < branch.sections.length ; ++i) {
      section = branch.sections[i];
      expect(section.events.get(0).frequency.value.value).toEqual('220');
    }
  });

  it('offset', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/offset_test"), null ,null).tree
    let root = tree.rootSection;

    expect(root.events.get(0).startOffset.value).toEqual("10%");
    expect(root.events.get(0).endOffset.value).toEqual("-10%");
    expect(root.events.get(1).startOffset.value).toEqual("0.1");
    expect(root.events.get(1).endOffset.value).toEqual("-0.1");
  });

  it('selector', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/selector_test"), null ,null).tree
    let root = tree.rootSection;
    expect(root.sections.length).toEqual(2);
    let events = root.sections[0].events
    expect(events.get(0).values.size).toEqual(1);
    expect(events.get(0).values.get('cutoff').value).toEqual("100%");
    events = root.sections[1].events
    expect(events.get(0).values.size).toEqual(2);
    expect(events.get(0).values.get('cutoff').value).toEqual("80%");
    expect(events.get(0).values.get('attack').value).toEqual("90%");
  });

  it('pitchtest', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/pitch_test"), null ,null).tree
    let root = tree.rootSection;
    expect(root.pitch.zone.value).toBeCloseTo(293.66);
    expect(root.pitch.grid.value[14]).toBeCloseTo(196);
    expect(root.pitch.grid.value[15]).toBeCloseTo(261.63);
    expect(root.pitch.grid.value[16]).toBeCloseTo(329.63);
    expect(root.pitch.grid.value[17]).toBeCloseTo(392);
    let events = root.sections[0].events
    expect(events.get(0).frequency.value.type).toEqual("pitch");
    expect(events.get(0).frequency.value.value).toEqual("2");
    events = root.sections[1].events
    expect(events.get(0).frequency.value.type).toEqual("pitch");
    expect(events.get(0).frequency.value.value).toEqual("-1");
  });

  it('sequencetest', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/sequence_test"), null ,null).tree
    let root = tree.rootSection;
    expect(root.sequences.has('seq1')).toBeTrue();
    expect(root.sequences.get('seq1').map(v=>v.value)).toEqual(['3','2','1']);
    expect(root.sections[0].sequences.has('seq1')).toBeTrue();
    expect(root.sections[0].sequences.get('seq1').map(v=>v.value)).toEqual(['4']);
    expect(root.sections[1].sequences.has('seq2')).toBeTrue();
    expect(root.sections[1].sequences.get('seq2').map(v=>v.value)).toEqual(['4','erez','-1']);
    let val = root.events.get(0).frequency.value.value;

    expect(val).toBeInstanceOf(SequenceTrigger);
    expect(val.name).toEqual('seq1');
    expect(val.steps).toEqual(-2);
    
    for(let i = 0 ; i < 2 ; ++i) {
      let e = root.sections[i].events.get(0);
      let freqVal  = e.frequency.value.value;
      expect(freqVal).toBeInstanceOf(SequenceTrigger);
      expect(freqVal.name).toEqual('seq2');
      expect(freqVal.steps).toEqual(1);
    }
  });

  it('each', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("bla", "tests/tree_builder/each_test"), null ,null).tree
    let root = tree.rootSection;
    expect(root.sections.length).toEqual(4)
    let freqs = ['330','220','330','330']
    for(let i = 0 ; i < root.sections.length; ++i) {
      let event = root.sections[i].events.get(0);
      expect(event.frequency.value.value).toEqual(freqs[i]);
      if(i == 2) {
        expect(event.values.get('cutoff').value).toEqual('100%');
      }
    }
  });

  it('multi-file', function () {
    let treeBuilder = new TreeBuilder();
    let tree = treeBuilder.build(new TextContent("multifile1", "tests/tree_builder/multifile1"), [new TextContent("multifile2", "tests/tree_builder/multifile2")] ,null).tree
    let root = tree.rootSection;
    expect(root.tempo.value).toEqual("120bpm");
    expect(root.totalSections.value).toEqual(2);
    let sections = root.sections;
    expect(sections.length).toEqual(2);
    expect(sections[0].sectionLength.value).toEqual("1/4");
    expect(sections[0].beat == undefined || sections[0].beat.value == false).toBeTrue();
    expect(sections[1].beat.value).toBeTrue();

    let section = sections[0];
    expect(section.events.size).toEqual(1);
    expect(section.events.get(0).frequency).toBeDefined();
    expect(section.events.get(0).frequency.value.type).toEqual('frequency');
    expect(section.events.get(0).frequency.value.value).toEqual("440");
    expect(section.events.get(0).values.has('cutoff')).toBeTrue();
    expect(section.events.get(0).values.get('cutoff').value).toEqual("90%");
    expect(section.events.get(0).values.has('attack')).toBeTrue();
    expect(section.events.get(0).values.get('attack').value).toEqual("80%");

    section = sections[1];
    expect(section.events.size).toEqual(1);
    expect(section.events.get(0).frequency).toBeDefined();
    expect(section.events.get(0).frequency.value.type).toEqual('note');
    expect(section.events.get(0).frequency.value.value).toEqual("D3");
    expect(section.events.get(0).values.has('attack')).toBeTrue();
    expect(section.events.get(0).values.get('attack').value).toEqual("80%");
  });

});