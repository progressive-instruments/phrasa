import { KeyPrefixes, Property, ExpressionSubject, PhrasaSymbol } from "./symbols.js";
import * as Tree from '../PieceTree.js'
import * as ValueEvaluator from '../Evaluator.js'
import { TextContent } from "../TextContent.js";
import _ from 'lodash'
import {PhraseFileParser} from './PhraseFileParser.js'
import { TextPositionPoint, TextPosition } from "../PhrasaError.js";
import { ParsedPhrasaFile } from "./ITreeBuilder.js";
interface ExtendedSection extends Tree.Section {
  defaultInnerSection? : Tree.Section;
}

const EventsPostifxRegex = /(.+)~([1-9]\d*)?$/;
export function splitAssignKey(path: string) : string[] {
  let res: string[] = [];
  for(let key of path.split('.')) {

      let prefix = key.charAt(0);
      if(KeyPrefixes.has(key.charAt(0))) {
        key = key.slice(1);
        res.push(KeyPrefixes.get(prefix));
      }

      res.push(key);

      let postfixMatch = key.match(EventsPostifxRegex);
      if(postfixMatch) {
        res[res.length-1] = postfixMatch[1];
        if(postfixMatch[2]) {
          res.push(Property.Events)
          res.push(postfixMatch[2]);
        } else {
          res.push(Property.Event);
        }
      }
    }
    return res;
}


export abstract class ExpressionEvaluator {
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {throw new Error(`property ${propertyName} unknown`);}
  getInnerExprEvaulator(evaluatorSubject: string) {
    return this.getInnerAssigner(evaluatorSubject);
  }
  setStringValue(value : string, errorPosition: TextPosition) {
    throw new Error("value assign is not supported");
  }
  setSequenceExpression(sequence: Tree.SequenceTrigger, errorPosition: TextPosition) {
    throw new Error("sequence trigger is not supported");
  }
  assignEnd() {}
}

export class UseEvaluator extends ExpressionEvaluator {

  constructor(private _section: ExtendedSection,
    private _phraseFiles: ParsedPhrasaFile[]) {
    super();
  }
  setStringValue(phraseFile : string, errorPosition: TextPosition) {
    let index = this._phraseFiles.findIndex((f) => f.name == phraseFile)
    if(index == -1){
      throw new Error(`invalid phrase file ${phraseFile}`);
    }
    
    let parser = new PhraseFileParser(this._phraseFiles[index], this._phraseFiles.slice(index), this._section);
    parser.parse();
  }
}

export class SectionAssigner extends ExpressionEvaluator {
  constructor(private _section: ExtendedSection,
    private _phraseFiles: ParsedPhrasaFile[]) {
    super();
  }

    getInnerAssigner(propertyName: string) : ExpressionEvaluator {
      switch(propertyName) {
        case Property.Pitch:
          if(!this._section.pitch) {
            this._section.pitch = {};
          }
          return new PitchAssigner(this._section.pitch);
        case Property.Tempo:
          return new TempoAssigner(this._section);
        case Property.Sections:
          if(!this._section.sections) {
            this._section.sections = [];
          }
          if(!this._section.defaultInnerSection) {
            this._section.defaultInnerSection = {};
          }
          return new SectionsAssigner(this._section,this._phraseFiles);
        case Property.Length:
          return new LengthAssigner(this._section);
        case Property.Branches:
          if(!this._section.branches) {
            this._section.branches = new Map<string, Tree.Section>();
          }
          return new BranchesAssigner(this._section.branches,this._phraseFiles);
        case Property.Sequences:
          if(!this._section.sequences) {
            this._section.sequences = new Map<string, Tree.Sequence>();
          }
          return new SequencesAssigner(this._section.sequences);
        case ExpressionSubject.Use:
          return new UseEvaluator(this._section, this._phraseFiles);
        case Property.Events:
        case Property.Event:
          if(!this._section.events) {
            this._section.events = new Map<number,Tree.SectionEvent>();
          }
          const eventsAssigner = new EventsAssigner(this._section.events);
          if(propertyName == Property.Event) {
            return eventsAssigner.getInnerAssigner("1");
          }
          return eventsAssigner;
        case Property.DefaultInstrument:
            return new DefaultInstrumentAssigner(this._section);
        default:
            throw new Error(`unknown property ${propertyName}`);
      }
    }
    setStringValue(value : string, errorPosition: TextPosition) {
      if(value == PhrasaSymbol.Beat) {
        this._section.beat = {value: true,errorPosition: errorPosition};
      } else {
        super.setStringValue(value, errorPosition);
      }
    }
}

export class DefaultInstrumentAssigner extends ExpressionEvaluator {
  constructor(private _section: ExtendedSection){
    super();
  }

  setStringValue(value : string, errorPosition: TextPosition) {
    this._section.defaultInstrument = {value, errorPosition: errorPosition};
  }
}

export class SelectorAssigner extends ExpressionEvaluator {
  constructor(
    private _path:string[], 
    private _innerAssigner: ExpressionEvaluator) {
      super();
  }
  getInnerAssigner(property: string): ExpressionEvaluator{
    let assigner = this._innerAssigner.getInnerAssigner(property);
    for(const prop of this._path) {
      assigner = assigner.getInnerAssigner(prop);
    }
    return assigner;
  }
}


class TempoAssigner extends ExpressionEvaluator {
  constructor(private _section: ExtendedSection){
      super();
    }

    setStringValue(value : string, errorPosition: TextPosition) {
      this._section.tempo = {value: value, errorPosition: errorPosition};
    }
}


class ChordEvaluator extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  setStringValue(value: string, errorPosition: TextPosition) {
    this._pitch.grid = {value: ValueEvaluator.evaluate(value,[ValueEvaluator.ChordToGrid]), errorPosition: errorPosition};
  }
}

class ScaleEvaluator extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  setStringValue(value: string, errorPosition: TextPosition) {
    this._pitch.grid = {value: ValueEvaluator.evaluate(value,[ValueEvaluator.ScaleToGrid]), errorPosition: errorPosition};
  }
}

class PitchGridAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }
  getInnerExprEvaulator(assigner: string): ExpressionEvaluator {
    if(assigner == ExpressionSubject.Chord) {
      return new ChordEvaluator(this._pitch);
    } else if(assigner == ExpressionSubject.Scale) {
      return new ScaleEvaluator(this._pitch);
    }
    return super.getInnerAssigner(assigner);
  }

  setStringValue(value: string, errorPosition: TextPosition) {
    this._pitch.grid = {value: ValueEvaluator.evaluate(value,[ValueEvaluator.ScaleToGrid]), errorPosition: errorPosition}
  }
}

class PitchZoneAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch) {
    super();
  }

  setStringValue(value: string, errorPosition: TextPosition) {
    this._pitch.zone = {value: ValueEvaluator.evaluate(value,[ValueEvaluator.NoteToFrequency]), errorPosition: errorPosition};
  }
}

class PitchAssigner extends ExpressionEvaluator {
  constructor(private _pitch: Tree.Pitch){
    super();
  }

  getInnerAssigner(property: string) {
    if(property == Property.PitchGrid) {
      return new PitchGridAssigner(this._pitch);
    } else if (property == Property.PitchZone) {
      return new PitchZoneAssigner(this._pitch);
    }
    return super.getInnerAssigner(property);
  }

}



function getOrCreate<T,U>(map: Map<T,U> , key: T, defaultValue: ()=>U): U {
  if(!map.has(key)) {
    map.set(key, defaultValue());
  }
  return map.get(key);
}

class SectionsLengthAssigner extends ExpressionEvaluator {
  constructor(
    private _parentSection: ExtendedSection) {
    super();
  }
  setStringValue(value: string, errorPosition: TextPosition) { 
    const num = ValueEvaluator.evaluate(value, [ValueEvaluator.ToUnsignedInteger]);
    for(let i = this._parentSection.sections.length ; i < num ; ++i) {
      this._parentSection.sections.push(_.cloneDeep(this._parentSection.defaultInnerSection));
    }
    this._parentSection.totalSections = {value: num, errorPosition: errorPosition};
  }


}

class SectionsAssigner extends ExpressionEvaluator {
  constructor(
    private _parentSection: ExtendedSection,
    private _phraseFiles: ParsedPhrasaFile[]){
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    if(propertyName == Property.SectionsTotal){
      return new SectionsLengthAssigner(this._parentSection);
    }
    else if(propertyName == Property.SectionsEach) {
      let assigners :ExpressionEvaluator[] = 
        [
          new SectionAssigner(this._parentSection.defaultInnerSection, this._phraseFiles),
        ];
      if(this._parentSection.sections) {
        assigners.push(...this._parentSection.sections.map(section => new SectionAssigner(section,this._phraseFiles)));
      }
      return new MultiExpressionEvaluator(assigners);
    } else {
      const sectionIndexes = ValueEvaluator.evaluate(propertyName,[ValueEvaluator.OneBasedToZeroBaseRanged]);
      let assigners :ExpressionEvaluator[] = []; 
      for(const sectionIndex of sectionIndexes) {
        while(sectionIndex >= this._parentSection.sections.length) {
          this._parentSection.sections.push(_.cloneDeep(this._parentSection.defaultInnerSection));
        }
        assigners.push(new SectionAssigner(this._parentSection.sections[sectionIndex],this._phraseFiles));
      }
      return new MultiExpressionEvaluator(assigners);
    }
    
  }
}

class LengthAssigner extends ExpressionEvaluator {
  constructor(private _section: ExtendedSection){
    super();
  }
  setStringValue(value : string, errorPosition: TextPosition) {
    this._section.sectionLength = {value:value, errorPosition: errorPosition};
  }
}

class MultiExpressionEvaluator extends ExpressionEvaluator {
  constructor(private _assigners: ExpressionEvaluator[]) {
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    return new MultiExpressionEvaluator(this._assigners.map(a => a.getInnerAssigner(propertyName)));
  }
  getInnerExprEvaulator(propertyName: string) : ExpressionEvaluator {
    return new MultiExpressionEvaluator(this._assigners.map(a => a.getInnerExprEvaulator(propertyName)));
  }
  setStringValue(value: string, errorPosition: TextPosition) {
    for(const assigner of this._assigners) {
      assigner.setStringValue(value, errorPosition);
    }
  }
  assignEnd() {
    for(const assigner of this._assigners) {
      assigner.assignEnd();
    }
  }
}

class BranchesAssigner extends ExpressionEvaluator {
  constructor(private _branches: Map<string,ExtendedSection>,
    private _phraseFiles: ParsedPhrasaFile[]) {
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    
    if(!this._branches.has(propertyName)) {
      this._branches.set(propertyName,{});
    }
    return new SectionAssigner(this._branches.get(propertyName),this._phraseFiles);
  }
}

class SequencesAssigner extends ExpressionEvaluator {
  constructor(private _sequences: Map<string, Tree.Sequence>){
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    if(!this._sequences.has(propertyName)) {
      this._sequences.set(propertyName,[]);
    }
    return new SequenceAssigner(this._sequences.get(propertyName));
  }
}

class SequenceAssigner extends ExpressionEvaluator {
  constructor(private _sequence: Tree.Sequence){
    super();
    _sequence.length = 0; 
  }
  setStringValue(value: string, errorPosition: TextPosition) {
    this._sequence.push({value: value, errorPosition: errorPosition});
  }
}

const StepsExpression = /(^>+$)|(^<+$)/
class SequenceTriggerAssigner extends ExpressionEvaluator {
  _name : string;
  _steps : number;
  _errorPosition: TextPosition;
  constructor(private _valueAssigner: EventValueAssigner) {
    super()
    this._steps = 1;
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    this._name = propertyName;
    return this;
  }
  getInnerExprEvaulator(propertyName: string) : ExpressionEvaluator {
    throw new Error('name of sequence trigger unspecified')
  }

  setStringValue(propertyName: string, errorPosition: TextPosition) {
    let match = propertyName.match(StepsExpression)
    if(!match) {
      throw new Error('invalid sequence trigger argument');
    }
    this._steps = propertyName.length;
    if(propertyName.startsWith('<')) {
      this._steps *= -1;
    }
    this._errorPosition = errorPosition;
  }

  assignEnd() {
    if(this._name == undefined) {
      throw new Error('name of sequence trigger unspecified')
    }
    this._valueAssigner.setSequenceExpression(new Tree.SequenceTrigger (this._name, this._steps), this._errorPosition);
  }


}

class EventValueAssigner extends ExpressionEvaluator {
  constructor(
    private _event: Tree.SectionEvent, 
    private _valueKey : string){
    super();
  }

  getInnerExprEvaulator(property: string): ExpressionEvaluator {
    let keys = splitAssignKey(property);
    if(keys.length == 1 && keys[0] == Property.Sequences) {
      return new SequenceTriggerAssigner(this);
    } else if(keys.length == 2 && keys[0] == Property.Sequences) {
      return new SequenceTriggerAssigner(this).getInnerAssigner(keys[1]);
    }
    return super.getInnerAssigner(property);
  }

  setStringValue(value: string, errorPosition: TextPosition) {
    this.setValue(value, errorPosition);
  }

  setSequenceExpression(sequenceTrigger:Tree.SequenceTrigger, errorPosition: TextPosition ) {
    this.setValue(sequenceTrigger,errorPosition);
  }

  private setValue(value: string | Tree.SequenceTrigger, errorPosition: TextPosition) {
    if(this._valueKey === Property.EventInstrument) {
      if(typeof(value) == 'string') {
        this._event.instrument = {value: value,errorPosition: errorPosition };
      } else {
        throw new Error('instrument value must be a string')
      }
    } else if(this._valueKey === Property.EventStartOffset) {
      this._event.startOffset = {value: value,errorPosition: errorPosition };
    } else if(this._valueKey === Property.EventEndOffset) {
      this._event.endOffset = {value: value,errorPosition: errorPosition };
    } else if(this._valueKey === PhrasaSymbol.PitchEventValue) {
      this._event.frequency = {value: {type: 'pitch', value: value}, errorPosition: errorPosition};
    } else if(this._valueKey === PhrasaSymbol.FrequencyEventValue) {
      this._event.frequency = {value: {type: 'frequency', value: value}, errorPosition: errorPosition};
    } else if(this._valueKey === PhrasaSymbol.NoteEventValue) {
      this._event.frequency = {value: {type: 'note', value: value}, errorPosition: errorPosition};
    } else {
      this._event.values.set(this._valueKey, {value:value, errorPosition: errorPosition});
    }
  }
}

class EventAssigner extends ExpressionEvaluator {
  constructor(private event: Tree.SectionEvent){
    super();
  }
  getInnerAssigner(propertyName: string) : ExpressionEvaluator {
    return new EventValueAssigner(this.event, propertyName);
  }
}

class EventsAssigner extends ExpressionEvaluator {
  constructor(private _events: Map<number,Tree.SectionEvent>){
    super();
  }
  getInnerAssigner(eventNum: string) : ExpressionEvaluator {
    let index = ValueEvaluator.evaluate(eventNum,[ValueEvaluator.OneBasedToZeroBased]);
    if(index == null) { 
      throw new Error('invalid event key');
    }
    if(!this._events.has(index)) {
      this._events.set(index, {values: new Map<string, Tree.ValueWithErrorPosition<Tree.EventValue>>()});
    }
    return new EventAssigner(this._events.get(index));
  }
}
